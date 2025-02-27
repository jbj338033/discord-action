const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

const translations = {
  en: {
    success: "Success",
    failure: "Failed",
    cancelled: "Cancelled",
    skipped: "Skipped",
    repository: "Repository",
    workflow: "Workflow",
    branch: "Branch",
    commit: "Commit",
    triggeredBy: "Triggered by",
  },
  ko: {
    success: "성공",
    failure: "실패",
    cancelled: "취소됨",
    skipped: "건너뜀",
    repository: "저장소",
    workflow: "워크플로우",
    branch: "브랜치",
    commit: "커밋",
    triggeredBy: "트리거",
  },
  ja: {
    success: "成功",
    failure: "失敗",
    cancelled: "キャンセル",
    skipped: "スキップ",
    repository: "リポジトリ",
    workflow: "ワークフロー",
    branch: "ブランチ",
    commit: "コミット",
    triggeredBy: "トリガー",
  },
};

function getStatusColor(status) {
  const colors = {
    success: 3066993,
    failure: 15158332,
    cancelled: 16763904,
    skipped: 4886754,
  };

  return colors[status.toLowerCase()] || 3447003;
}

function getStatusEmoji(status) {
  const emojis = {
    success: "✅",
    failure: "❌",
    cancelled: "⚠️",
    skipped: "⏭️",
  };

  return emojis[status.toLowerCase()] || "";
}

function createEmbed(context, status, lang) {
  const t = translations[lang] || translations.en;

  const { workflow, ref, sha, actor, serverUrl, repo } = context;
  const repoUrl = `${serverUrl}/${repo.owner}/${repo.repo}`;
  const runUrl = `${repoUrl}/actions/runs/${context.runId}`;

  const branch = ref.replace("refs/heads/", "");

  const statusEmoji = getStatusEmoji(status);
  const statusText = t[status.toLowerCase()] || status;

  const embed = {
    color: getStatusColor(status),
    title: `${statusEmoji} ${workflow} - ${statusText}`,
    url: runUrl,
    fields: [
      {
        name: t.repository,
        value: `[${repo.owner}/${repo.repo}](${repoUrl})`,
        inline: true,
      },
      {
        name: t.branch,
        value: branch,
        inline: true,
      },
      {
        name: t.commit,
        value: `[\`${sha.substring(0, 7)}\`](${repoUrl}/commit/${sha})`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: `GitHub Actions`,
      icon_url:
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
  };

  if (actor) {
    embed.fields.push({
      name: t.triggeredBy,
      value: `[@${actor}](https://github.com/${actor})`,
      inline: true,
    });
  }

  return embed;
}

async function sendDiscordNotification(webhook, embed) {
  try {
    await axios.post(webhook, {
      embeds: [embed],
    });
    return true;
  } catch (error) {
    core.error(`Error sending Discord notification: ${error.message}`);
    return false;
  }
}

async function run() {
  try {
    const webhook = core.getInput("webhook", { required: true });
    const language = core.getInput("language") || "en";

    const context = github.context;
    const status =
      process.env.GITHUB_JOB_STATUS ||
      (context.payload.workflow_run
        ? context.payload.workflow_run.conclusion
        : "success");

    const embed = createEmbed(context, status, language);

    const success = await sendDiscordNotification(webhook, embed);

    if (success) {
      core.info("Discord notification sent successfully");
    } else {
      core.setFailed("Failed to send Discord notification");
    }
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
}

run();
