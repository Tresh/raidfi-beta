// Telegram bot webhook: account linking + slash commands.
// Public endpoint (verify_jwt = false). Verifies X-Telegram-Bot-Api-Secret-Token.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
import { SITE_ORIGIN, ROOT_DOMAIN } from "../_shared/config.ts";

const TWEET_URL_REGEX = /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)/i;

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function deriveSecret(apiKey: string) {
  const data = new TextEncoder().encode(`telegram-webhook:${apiKey}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeEqual(a: string | null, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

interface Btn { text: string; url?: string; callback_data?: string; }

async function tg(method: string, body: Record<string, unknown>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) throw new Error("Telegram not configured");
  const r = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) console.error("tg error", method, r.status, JSON.stringify(data));
  return { ok: r.ok, data };
}

async function reply(chatId: number, text: string, buttons: Btn[][] = [], replyTo?: number) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (replyTo) body.reply_to_message_id = replyTo;
  if (buttons.length) body.reply_markup = { inline_keyboard: buttons };
  return tg("sendMessage", body);
}

async function deleteMsg(chatId: number, messageId: number) {
  try { await tg("deleteMessage", { chat_id: chatId, message_id: messageId }); } catch { /* ignore */ }
}

// Schedule a bot message for self-destruct so chats stay clean.
function deleteAfter(chatId: number, messageId: number | undefined, secs: number) {
  if (!messageId) return;
  const task = new Promise((r) => setTimeout(r, secs * 1000)).then(() => deleteMsg(chatId, messageId));
  try { (globalThis as any).EdgeRuntime?.waitUntil?.(task); } catch { /* ignore */ }
}

// Send a message that removes itself after `secs`.
async function replyTemp(
  chatId: number, text: string, buttons: Btn[][] = [], replyTo?: number, secs = 25,
) {
  const res = await reply(chatId, text, buttons, replyTo);
  deleteAfter(chatId, (res as any)?.data?.result?.message_id, secs);
  return res;
}


function isPrivate(chatType: string) { return chatType === "private"; }
function isGroup(chatType: string) { return chatType === "group" || chatType === "supergroup"; }

const HELP = `<b>RaidFi bot - quick reference</b>

<b>Get started</b>
/start · welcome + linking help
/link &lt;code|email&gt; · link your account (DM)
/verify &lt;otp&gt; · finish email linking (DM)
/help · this list

<b>Your account (DM only)</b>
/whoami · your linked email
/mypoints · your XP, rank & approved posts
/subscribe · /unsubscribe · toggle task DMs

<b>Contribute</b>
/tasks · open tasks (here or in the group)
/submit &lt;x-url&gt; · submit an X post (works in DM and in groups)

<b>Community</b>
/leaderboard · top contributors
/whitepaper · read the whitepaper

<b>Admins</b>
/give @user 50 reason · award XP (RaidFi admins anywhere, project admins in their own group)
Reply to a message with <code>/give 50 reason</code> to award the person you replied to.

<i>Group commands work in the official RaidFi group and in a project's own connected group. Personal stuff stays in DM so your email isn't shared publicly.</i>`;

const START_DM = `<b>Welcome to RaidFi 👋</b>

I'm your RaidFi assistant. From right here in Telegram you can:

📝 <b>Submit posts</b> - send <code>/submit https://x.com/you/status/123</code> (works here and in groups). I'll ask which project it's for.
⭐ <b>Track your XP</b> - /mypoints shows your XP, rank and approved posts
🎯 <b>Find tasks</b> - /tasks lists open tasks, and I'll DM you when new ones drop
🏆 <b>Leaderboard</b> - /leaderboard shows top contributors
📄 <b>Whitepaper</b> - /whitepaper

<b>Step 1 - connect your account</b> (one time)
• <b>Code:</b> get your code at <a href="${SITE_ORIGIN}/dashboard/contributions">${ROOT_DOMAIN}/dashboard/contributions</a> and send <code>/link YOURCODE</code>
• <b>Email:</b> send <code>/link you@example.com</code>, then <code>/verify 123456</code> with the code we email you

<b>Step 2 - start contributing</b>
Submit your first post with /submit and watch your XP grow.

Other: /whoami · /subscribe · /unsubscribe · /help`;

const START_GROUP = `Hey, I'm the RaidFi bot 👋

To submit a post here, use the command:
<code>/submit https://x.com/you/status/123</code>

I also answer /tasks, /leaderboard and /whitepaper.
Not connected yet? DM me → @raidficontributionbot and send /start.`;

// Shared submission path used by /submit and by plain "dropped" links.
async function submitPost(supabase: any, email: string, url: string, projectId?: string | null): Promise<{ error?: string }> {
  // Ensure a profile row exists so contributions link to a real user.
  const { data: existingProfile } = await supabase
    .from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (!existingProfile?.user_id) {
    const { data: usersList } = await supabase.auth.admin.listUsers();
    const authUser = usersList?.users?.find(
      (u: any) => (u.email || "").toLowerCase() === email.toLowerCase()
    );
    if (authUser) {
      const { data: wl } = await supabase.from("waitlist_submissions")
        .select("referral_code").eq("email", email).maybeSingle();
      const payload: any = { user_id: authUser.id, email, waitlist_completed: true };
      if ((wl as any)?.referral_code) payload.referral_code = (wl as any).referral_code;
      await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    }
  }

  const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/submit-contribution`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      apikey: `${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({
      post_url: url,
      user_email: email,
      content_type: "post",
      origin: SITE_ORIGIN,
      ...(projectId ? { project_id: projectId } : {}),
    }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || out?.error) return { error: out?.error || "Couldn't submit that post." };
  return {};
}

// Returns the project connected to this Telegram group, if any.
async function projectForChat(supabase: any, chatId: number) {
  const { data } = await supabase
    .from("projects").select("id,name")
    .eq("telegram_group_id", String(chatId))
    .eq("status", "active")
    .maybeSingle();
  return data ?? null;
}

// Resolve the RaidFi email behind a Telegram user id.
async function emailForTelegramUser(supabase: any, telegramUserId: number): Promise<string | null> {
  const { data } = await supabase
    .from("telegram_links").select("email").eq("telegram_user_id", telegramUserId).maybeSingle();
  return data?.email ?? null;
}

// Can this Telegram user hand out points here?
async function canGrantPoints(supabase: any, email: string, projectId: string | null) {
  const { data: profile } = await supabase
    .from("profiles").select("user_id").ilike("email", email).maybeSingle();
  if (profile?.user_id) {
    const { data: staff } = await supabase.rpc("is_super_or_admin", { _user_id: profile.user_id });
    if (staff) return true;
  }
  if (!projectId) return false;
  const { data: member } = await supabase
    .from("project_members").select("member_role,user_id,email")
    .eq("project_id", projectId).ilike("email", email).maybeSingle();
  return !!member && ["project_admin", "owner"].includes(member.member_role);
}

// /give @user 50 reason  |  /give you@mail.com 50 reason  |  reply + /give 50 reason
async function handleGive(ctx: {
  supabase: any; chatId: number; msgId: number; fromId: number; chatType: string; arg: string;
  groupProject: { id: string; name: string } | null; replyToFrom: any;
}) {
  const { supabase, chatId, msgId, fromId, arg, groupProject, replyToFrom } = ctx;
  const projectId = groupProject?.id ?? null;

  const usage = `<b>Give points</b>\n<code>/give @username 50 played the quiz</code>\n<code>/give someone@mail.com 50 reason</code>\nOr reply to their message with <code>/give 50 reason</code>.`;

  const granterEmail = await emailForTelegramUser(supabase, fromId);
  if (!granterEmail) {
    await reply(chatId, `🔒 Link your RaidFi account first (DM me /start) before giving points.`, [], msgId);
    return;
  }
  const allowed = await canGrantPoints(supabase, granterEmail, projectId);
  if (!allowed) {
    await reply(chatId, `⛔ Only RaidFi admins${groupProject ? ` or ${escapeHtml(groupProject.name)} admins` : ""} can give points here.`, [], msgId);
    return;
  }

  const parts = arg.split(/\s+/).filter(Boolean);
  if (!parts.length) { await reply(chatId, usage, [], msgId); return; }

  let targetToken: string | null = null;
  let amountToken: string | undefined;
  if (/^-?\d+$/.test(parts[0])) {
    amountToken = parts[0];
    parts.shift();
  } else {
    targetToken = parts.shift()!;
    amountToken = parts.shift();
  }
  const points = Number(amountToken);
  if (!Number.isFinite(points) || !Number.isInteger(points) || points === 0 || Math.abs(points) > 100000) {
    await reply(chatId, usage, [], msgId);
    return;
  }
  const reason = parts.join(" ").slice(0, 200);

  // Resolve the recipient.
  let targetEmail: string | null = null;
  let targetLabel = "";
  if (targetToken?.includes("@") && targetToken.includes(".")) {
    targetEmail = targetToken.replace(/^@/, "").toLowerCase();
    targetLabel = targetEmail;
  } else if (targetToken) {
    const uname = targetToken.replace(/^@/, "");
    const { data: l } = await supabase
      .from("telegram_links").select("email,telegram_username").ilike("telegram_username", uname).maybeSingle();
    targetEmail = l?.email ?? null;
    targetLabel = `@${uname}`;
  } else if (replyToFrom?.id) {
    targetEmail = await emailForTelegramUser(supabase, replyToFrom.id);
    targetLabel = replyToFrom.username ? `@${replyToFrom.username}` : (replyToFrom.first_name ?? "that member");
  }

  if (!targetEmail) {
    await reply(chatId,
      `❓ I couldn't find a linked RaidFi account for ${escapeHtml(targetLabel || "that person")}. They need to DM me /start and link first.`,
      [], msgId);
    return;
  }

  const { data: exists } = await supabase.rpc("check_email_exists", { check_email: targetEmail });
  if (!exists) {
    await reply(chatId, `❓ <b>${escapeHtml(targetEmail)}</b> isn't a RaidFi account.`, [], msgId);
    return;
  }

  const description = reason
    ? `${reason}${groupProject ? ` (${groupProject.name})` : ""}`
    : `Points from ${groupProject ? groupProject.name : "RaidFi"} admin`;

  const { error } = await supabase.from("user_activities").insert({
    user_email: targetEmail,
    activity_type: "admin_grant",
    description,
    points,
    metadata: {
      source: "telegram",
      chat_id: chatId,
      granted_by: granterEmail,
      project_id: projectId,
    },
  });
  if (error) {
    await reply(chatId, `⚠️ Couldn't save that: ${escapeHtml(error.message)}`, [], msgId);
    return;
  }

  const { data: score } = await supabase
    .from("leaderboard_scores").select("total_xp").eq("email", targetEmail).maybeSingle();

  await reply(chatId,
    `${points > 0 ? "🎁" : "➖"} <b>${points > 0 ? "+" : ""}${points} XP</b> to ${escapeHtml(targetLabel || targetEmail)}` +
    `${reason ? `\n<i>${escapeHtml(reason)}</i>` : ""}` +
    `${groupProject ? `\nProject: <b>${escapeHtml(groupProject.name)}</b>` : ""}` +
    `\nNew total: <b>${score?.total_xp ?? 0} XP</b>`,
    [], msgId);
}

// Ask which project a post belongs to, using inline buttons.
async function askProject(
  supabase: any, chatId: number, msgId: number, email: string, telegramUserId: number, url: string,
): Promise<boolean> {
  const { data: projects } = await supabase
    .from("projects").select("id,name").eq("status", "active").order("name").limit(8);
  if (!projects?.length) return false;

  const token = crypto.randomUUID().slice(0, 8);
  await supabase.from("telegram_pending_submissions").insert({
    token, telegram_user_id: telegramUserId, chat_id: chatId, message_id: msgId, post_url: url, email,
  });

  const buttons: Btn[][] = (projects as any[]).map((p) => [
    { text: p.name, callback_data: `p:${token}:${p.id}` },
  ]);
  buttons.push([{ text: "RaidFi", callback_data: `p:${token}:none` }]);

  // Self-destructs so the chat doesn't fill up with prompts.
  await replyTemp(chatId, `Which project is this post about?`, buttons, msgId, 120);
  return true;
}

async function handleCallback(cb: any, supabase: any) {
  const data: string = cb.data ?? "";
  const chatId: number = cb.message?.chat?.id;
  const promptMsgId: number | undefined = cb.message?.message_id;
  const answer = (text: string) => tg("answerCallbackQuery", { callback_query_id: cb.id, text });
  if (!data.startsWith("p:") || !chatId) { await answer(""); return; }

  const [, token, choice] = data.split(":");
  const { data: pending } = await supabase
    .from("telegram_pending_submissions").select("*").eq("token", token).maybeSingle();
  if (!pending) { await answer("This request expired. Send the link again."); return; }
  if (pending.telegram_user_id !== cb.from?.id) { await answer("Not your submission."); return; }

  await supabase.from("telegram_pending_submissions").delete().eq("token", token);

  // Keep the Telegram identity fresh whenever we see the user act.
  await supabase.from("telegram_links").update({
    telegram_username: cb.from?.username || null,
    first_name: cb.from?.first_name || null,
  }).eq("telegram_user_id", cb.from?.id);

  const projectId = choice === "none" ? null : choice;
  const out = await submitPost(supabase, pending.email, pending.post_url, projectId);
  await answer(out.error ? "Could not submit" : "Submitted");

  // The question has been answered - clear it.
  if (promptMsgId) await deleteMsg(chatId, promptMsgId);

  if (out.error) {
    await reply(chatId, `⚠️ ${escapeHtml(out.error)}`, [], pending.message_id ?? undefined);
    return;
  }

  let label = "RaidFi";
  if (projectId) {
    const { data: p } = await supabase.from("projects").select("name").eq("id", projectId).maybeSingle();
    label = p?.name ? escapeHtml(p.name) : "your project";
  }
  await replyTemp(chatId, `✅ Tracked for <b>${label}</b> - your post is in review.`, [], pending.message_id ?? undefined, 25);
}


async function handle(update: any, supabase: any) {
  if (update.callback_query) {
    await handleCallback(update.callback_query, supabase);
    return;
  }
  const message = update.message;
  if (Array.isArray(message?.new_chat_members) && message.new_chat_members.some((u: any) => u?.is_bot && /raidficontributionbot/i.test(u?.username ?? ""))) {
    await reply(message.chat.id,
      `👋 Thanks for adding RaidFi!\n\n🆔 Group ID: <code>${message.chat.id}</code>\n\n<b>Project admin?</b> Make me a group admin, then send <code>/connectproject</code> here to link this group to your project in one step.`,
      [], undefined);
    return;
  }
  if (!message?.text) return;

  const chatId: number = message.chat.id;
  const chatType: string = message.chat.type;
  const fromId: number = message.from?.id;
  const fromUsername: string | undefined = message.from?.username;
  const firstName: string | undefined = message.from?.first_name;
  const text: string = message.text.trim();
  const msgId: number = message.message_id;

  // Which project (if any) owns this group chat?
  const groupProject = isGroup(chatType) ? await projectForChat(supabase, chatId) : null;

  // Parse command, strip bot suffix in groups
  const m = text.match(/^\/(\w+)(?:@\w+)?(?:\s+(.+))?$/s);
  if (!m) {
    // Plain links only work in DM. In groups we require /submit so the bot
    // never reacts to normal chatter.
    if (!isPrivate(chatType)) return;

    const found = text.match(/https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i);
    if (!found) return;
    const droppedUrl = found[0];

    const { data: dropLink } = await supabase
      .from("telegram_links").select("*").eq("telegram_user_id", fromId).maybeSingle();
    if (!dropLink) {
      await reply(chatId,
        `🔒 Link your RaidFi account first - send <code>/start</code> and follow the steps.`,
        [], msgId);
      return;
    }

    const asked = await askProject(supabase, chatId, msgId, dropLink.email, fromId, droppedUrl);
    if (asked) return;

    const out = await submitPost(supabase, dropLink.email, droppedUrl, null);
    if (out.error) {
      await reply(chatId, `⚠️ ${escapeHtml(out.error)}`, [], msgId);
    } else {
      await reply(chatId, `✅ Tracked - your post is in review.`, [], msgId);
    }
    return;
  }

  const cmd = m[1].toLowerCase();
  const arg = (m[2] || "").trim();


  // ---- Chat-type gating ----
  // Commands allowed in groups (official RaidFi group or a project's own group):
  const GROUP_ALLOWED = new Set(["start", "help", "tasks", "leaderboard", "whitepaper", "give", "points", "submit", "groupid", "connectproject"]);
  // Commands that ONLY work in DM (private chat):
  const DM_ONLY = new Set(["link", "verify", "whoami", "mypoints", "subscribe", "unsubscribe"]);


  if (isGroup(chatType)) {
    // Any group can use the bot; unrecognised groups are treated as RaidFi.
    if (DM_ONLY.has(cmd)) {
      await reply(chatId,
        `🤫 That's a personal command - please DM me instead.`,
        [[{ text: "💬 Open DM", url: `https://t.me/raidficontributionbot` }]],
        msgId);
      return;
    }
    if (!GROUP_ALLOWED.has(cmd)) {
      // Unknown / not-allowed in group - stay quiet
      return;
    }
  }

  if (cmd === "give" || cmd === "points") {
    await handleGive({
      supabase, chatId, msgId, fromId, chatType, arg,
      groupProject, replyToFrom: message.reply_to_message?.from ?? null,
    });
    return;
  }

  // Look up existing link by Telegram user id
  const { data: link } = await supabase
    .from("telegram_links")
    .select("*")
    .eq("telegram_user_id", fromId)
    .maybeSingle();

  const requireLink = async () => {
    if (link) return true;
    await reply(chatId,
      isPrivate(chatType)
        ? `🔒 You need to connect your RaidFi account first.\nSend <code>/start</code> and follow the steps.`
        : `🔒 <b>You're not connected yet.</b>\nDM me and send <code>/start</code> to connect your RaidFi account, then come back and try again.`,
      isPrivate(chatType) ? [] : [[{ text: "💬 Connect in DM", url: `https://t.me/raidficontributionbot?start=link` }]],
      msgId,
    );
    return false;
  };


  switch (cmd) {
    case "groupid": {
      await reply(chatId, `🆔 This chat's ID: <code>${chatId}</code>`, [], msgId);
      return;
    }
    case "connectproject": {
      if (!isGroup(chatType)) {
        await reply(chatId, `Run <code>/connectproject</code> inside your project's group.`, [], msgId);
        return;
      }
      if (!(await requireLink())) return;
      const { data: mems } = await supabase.from("project_members")
        .select("project_id, member_role, projects:project_id(name,slug)")
        .ilike("email", link.email)
        .in("member_role", ["owner", "project_admin", "manager"]);
      const list = (mems ?? []) as any[];
      const wanted = (arg ?? "").trim().toLowerCase();
      const pick = wanted ? list.find((x) => x.projects?.slug?.toLowerCase() === wanted) : list[0];
      if (!pick || (!wanted && list.length > 1)) {
        await reply(chatId, list.length
          ? `You manage several projects. Send <code>/connectproject slug</code>:\n${list.map((x) => `• <code>${escapeHtml(x.projects?.slug ?? "")}</code>`).join("\n")}`
          : `❌ Your connected account isn't an admin of any RaidFi project.`, [], msgId);
        return;
      }
      await supabase.from("projects").update({ telegram_group_id: String(chatId), telegram_bot_added: true }).eq("id", pick.project_id);
      await reply(chatId, `✅ This group is now linked to <b>${escapeHtml(pick.projects?.name ?? "your project")}</b>. New contributions will be posted here.`, [], msgId);
      return;
    }
    case "start": {
      await reply(chatId, isPrivate(chatType) ? START_DM : START_GROUP, [], msgId);
      return;
    }
    case "help": {
      await reply(chatId, HELP, [], msgId);
      return;
    }

    case "link": {
      if (!arg) {
        await reply(chatId, `Usage:\n<code>/link CODE</code>  (one-time code from the site)\n<code>/link you@example.com</code>  (email OTP)`, [], msgId);
        return;
      }

      if (link) {
        await reply(chatId, `✅ You're already linked to <b>${escapeHtml(link.email)}</b>.\nUse /whoami or /help.`, [], msgId);
        return;
      }

      // Email path
      if (arg.includes("@")) {
        if (!isPrivate(chatType)) {
          await reply(chatId, `For privacy, please link your email in a DM with me.`, [], msgId);
          return;
        }
        const email = arg.toLowerCase();
        const { data: exists } = await supabase.rpc("check_email_exists", { check_email: email });
        if (!exists) {
          await reply(chatId,
            `❌ No RaidFi account found for this email.\n\nRequest beta access or sign up on the site first:`,
            [[{ text: "🚀 Request Beta Access", url: `${SITE_ORIGIN}/#beta-access` }]],
            msgId,
          );
          return;
        }
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        if (error) {
          await reply(chatId, `❌ Could not send OTP: ${escapeHtml(error.message)}`, [], msgId);
          return;
        }
        // Stash pending email in link_codes table (code = "pending:<telegram_user_id>")
        const pendingKey = `pending:${fromId}`;
        await supabase.from("telegram_link_codes").upsert({
          code: pendingKey,
          email,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          used: false,
        });
        await reply(chatId,
          `📨 We sent a 6-digit code to <b>${escapeHtml(email)}</b>.\nReply with:\n<code>/verify 123456</code>`,
          [], msgId);
        return;
      }

      // Code path
      const code = arg.toUpperCase().replace(/\s+/g, "");
      const { data: row } = await supabase
        .from("telegram_link_codes")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (!row || row.used || new Date(row.expires_at).getTime() < Date.now()) {
        await reply(chatId, `❌ Invalid or expired code. Generate a fresh one in <a href="${SITE_ORIGIN}/dashboard/contributions">Contributions</a>.`, [], msgId);
        return;
      }
      await supabase.from("telegram_links").upsert({
        telegram_user_id: fromId,
        telegram_chat_id: chatId,
        telegram_username: fromUsername || null,
        first_name: firstName || null,
        email: row.email,
        dm_subscribed: true,
      }, { onConflict: "telegram_user_id" });
      await supabase.from("telegram_link_codes").update({ used: true }).eq("code", code);
      await reply(chatId, `✅ Linked to <b>${escapeHtml(row.email)}</b>!\nTry /mypoints or /tasks.`, [], msgId);
      return;
    }

    case "verify": {
      if (!isPrivate(chatType)) {
        await reply(chatId, `Send /verify in a DM with me.`, [], msgId);
        return;
      }
      if (!arg) { await reply(chatId, `Usage: <code>/verify 123456</code>`, [], msgId); return; }
      const pendingKey = `pending:${fromId}`;
      const { data: pending } = await supabase
        .from("telegram_link_codes")
        .select("*")
        .eq("code", pendingKey)
        .maybeSingle();
      if (!pending || pending.used || new Date(pending.expires_at).getTime() < Date.now()) {
        await reply(chatId, `❌ No pending link. Start with <code>/link you@example.com</code>`, [], msgId);
        return;
      }
      const otp = arg.replace(/\D/g, "");
      const { error } = await supabase.auth.verifyOtp({ email: pending.email, token: otp, type: "email" });
      if (error) {
        await reply(chatId, `❌ Invalid code: ${escapeHtml(error.message)}`, [], msgId);
        return;
      }
      await supabase.from("telegram_links").upsert({
        telegram_user_id: fromId,
        telegram_chat_id: chatId,
        telegram_username: fromUsername || null,
        first_name: firstName || null,
        email: pending.email,
        dm_subscribed: true,
      }, { onConflict: "telegram_user_id" });
      await supabase.from("telegram_link_codes").update({ used: true }).eq("code", pendingKey);
      await reply(chatId, `✅ Linked to <b>${escapeHtml(pending.email)}</b>!\nTry /mypoints or /tasks.`, [], msgId);
      return;
    }

    case "whoami": {
      if (!(await requireLink())) return;
      await reply(chatId,
        `👤 <b>${escapeHtml(link.email)}</b>\nTelegram: @${escapeHtml(fromUsername || "-")}\nTask DMs: ${link.dm_subscribed ? "on 🔔" : "off 🔕"}`,
        [], msgId);
      return;
    }

    case "subscribe":
    case "unsubscribe": {
      if (!(await requireLink())) return;
      const sub = cmd === "subscribe";
      await supabase.from("telegram_links").update({ dm_subscribed: sub }).eq("telegram_user_id", fromId);
      await reply(chatId, sub ? `🔔 Task DM alerts: ON.` : `🔕 Task DM alerts: OFF.`, [], msgId);
      return;
    }

    case "mypoints": {
      if (!(await requireLink())) return;
      const { data: score } = await supabase
        .from("leaderboard_scores")
        .select("total_xp")
        .eq("email", link.email)
        .maybeSingle();
      const { data: lb } = await supabase.rpc("get_leaderboard", { _period: "all" });
      const idx = (lb || []).findIndex((r: any) => r.email?.includes(link.email.split("@")[0].slice(0, 2)));
      const myEntry = (lb || []).find((r: any) => r.email === link.email) || (lb || [])[idx];
      const rank = myEntry?.overall_rank ?? "-";
      const { count: contribCount } = await supabase
        .from("contributions")
        .select("id", { count: "exact", head: true })
        .eq("user_email", link.email)
        .eq("status", "approved");
      await reply(chatId,
        `🏆 <b>Your RaidFi Stats</b>\n\n💎 XP: <b>${score?.total_xp ?? 0}</b>\n📈 Rank: <b>#${rank}</b>\n✅ Approved contributions: <b>${contribCount ?? 0}</b>`,
        [[{ text: "📊 Open Dashboard", url: `${SITE_ORIGIN}/dashboard/contributions` }]],
        msgId);
      return;
    }

    case "leaderboard": {
      const { data: lb } = await supabase.rpc("get_leaderboard", { _period: "all" });
      const top = (lb || []).slice(0, 10);
      if (!top.length) { await reply(chatId, `No leaderboard data yet.`, [], msgId); return; }
      const lines = top.map((r: any, i: number) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        const name = escapeHtml(r.display_name || r.email);
        return `${medal} <b>${name}</b> - ${r.total_xp} XP`;
      });
      await reply(chatId, `📊 <b>RaidFi Leaderboard - Top 10</b>\n\n${lines.join("\n")}`,
        [[{ text: "🌐 Full Leaderboard", url: `${SITE_ORIGIN}/dashboard/contributions` }]], msgId);
      return;
    }

    case "tasks": {
      const { data: tasks } = await supabase
        .from("contribute_tasks")
        .select("id,label,description,points,is_pinned")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);
      if (!tasks?.length) { await reply(chatId, `No open tasks right now. Check back soon.`, [], msgId); return; }
      const lines = (tasks as any[]).map((t) =>
        `${t.is_pinned ? "📌" : "•"} <b>${escapeHtml(t.label)}</b> - +${t.points} XP${t.description ? `\n   <i>${escapeHtml(t.description.slice(0, 120))}</i>` : ""}`
      );
      await reply(chatId,
        `📝 <b>Open Contribute Tasks</b>\n\n${lines.join("\n\n")}`,
        [[{ text: "✅ Do Tasks", url: `${SITE_ORIGIN}/dashboard/contributions` }]], msgId);
      return;
    }

    case "submit": {
      if (!(await requireLink())) return;
      const url = (arg.match(/https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/\s]+\/status\/\d+/i) || [])[0] || arg;
      if (!TWEET_URL_REGEX.test(url)) {
        await reply(chatId, `That doesn't look like a valid X post link.\nTry: <code>/submit https://x.com/user/status/123</code>`, [], msgId);
        return;
      }

      // In a project's own group the project is implied; elsewhere ask.
      if (!groupProject) {
        const asked = await askProject(supabase, chatId, msgId, link.email, fromId, url);
        if (asked) return;
      }

      const out = await submitPost(supabase, link.email, url, groupProject?.id ?? null);
      if (out.error) {
        await reply(chatId, `${escapeHtml(out.error)}`,
          [[{ text: "Open Settings", url: `${SITE_ORIGIN}/dashboard/settings` }]], msgId);
        return;
      }

      await reply(chatId,
        groupProject
          ? `✅ Tracked for <b>${escapeHtml(groupProject.name)}</b> - an admin will review it shortly.`
          : `Got it - your post is in.\nAn admin will review shortly and it'll show up on the live feed.`,
        [[{ text: "View post", url }]], msgId);
      return;

    }

    case "whitepaper": {
      const { data: wp } = await supabase.from("whitepaper_live").select("version,updated_at").eq("id", "live").maybeSingle();
      await reply(chatId,
        `📜 <b>RaidFi Whitepaper</b>${wp?.version ? `\nVersion: <b>${escapeHtml(String(wp.version))}</b>` : ""}`,
        [[{ text: "📖 Read", url: `${SITE_ORIGIN}/whitepaper` }]], msgId);
      return;
    }

    default:
      // Ignore unknown commands silently in groups; reply in DM
      if (isPrivate(chatType)) {
        await reply(chatId, `Unknown command. Try /help.`, [], msgId);
      }
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!TELEGRAM_API_KEY) return new Response("Bot not configured", { status: 500 });

  const expected = await deriveSecret(TELEGRAM_API_KEY);
  const got = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!safeEqual(got, expected)) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let update: any;
  try { update = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

  // Idempotency
  if (typeof update.update_id === "number") {
    const message = update.message ?? update.edited_message;
    await supabase.from("telegram_updates").upsert({
      update_id: update.update_id,
      chat_id: message?.chat?.id ?? null,
      user_id: message?.from?.id ?? null,
      text: message?.text ?? null,
      raw_update: update,
    }, { onConflict: "update_id" });
  }

  try {
    await handle(update, supabase);
  } catch (e) {
    console.error("handle error", e);
  }
  // Always 200 so Telegram doesn't retry
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
