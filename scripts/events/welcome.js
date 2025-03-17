const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "1.7",
        author: "NTKhang",
        category: "events"
    },

    langs: {
        vi: {
            session1: "sáng",
            session2: "trưa",
            session3: "chiều",
            session4: "tối",
            welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
            multiple1: "bạn",
            multiple2: "các bạn",
            defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
        },
        en: {
            session1: "morning",
            session2: "noon",
            session3: "afternoon",
            session4: "evening",
            welcomeMessage: "𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐢𝐧𝐯𝐢𝐭𝐢𝐧𝐠 𝐦𝐞 𝐭𝐨 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩!\n─────⊱◈☘️◈⊰─────\n𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱: 〖%1〗\n─────⊱◈☘️◈⊰─────\n𝐄𝐧𝐭𝐞𝐫 %1help 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬",
            multiple1: "you",
            multiple2: "you guys",
            defaultWelcomeMessage: `╭─⌾👋𝙒𝙀𝙇𝘾𝙊𝙈𝙀 𝙐𝙎𝙀𝙍👋\n│{userName}\n│\n𝙂𝙍𝙊𝙐𝙋 𝙉𝘼𝙈𝙀:\n│{boxName}\n╰─────────⌾`
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType == "log:subscribe") {
            return async function () {
                const hours = getTime("HH");
                const { threadID } = event;
                const { nickNameBot } = global.GoatBot.config;
                const prefix = global.utils.getPrefix(threadID);
                const dataAddedParticipants = event.logMessageData.addedParticipants;

                // if new member is bot
                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
                    if (nickNameBot)
                        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                    return message.send(getLang("welcomeMessage", prefix));
                }

                // if new member:
                if (!global.temp.welcomeEvent[threadID])
                    global.temp.welcomeEvent[threadID] = {
                        joinTimeout: null,
                        dataAddedParticipants: []
                    };

                // push new member to array
                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
                // if timeout is set, clear it
                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                // set new timeout
                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
                    const threadData = await threadsData.get(threadID);
                    if (threadData.settings.sendWelcomeMessage == false)
                        return;
                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                    const dataBanned = threadData.data.banned_ban || [];
                    const threadName = threadData.threadName;
                    const userName = [],
                        mentions = [];
                    let multiple = false;

                    if (dataAddedParticipants.length > 1)
                        multiple = true;

                    for (const user of dataAddedParticipants) {
                        if (dataBanned.some((item) => item.id == user.userFbId))
                            continue;
                        userName.push(user.fullName);
                        mentions.push({
                            tag: user.fullName,
                            id: user.userFbId
                        });
                    }
                    // {userName}:   name of new member
                    // {multiple}:
                    // {boxName}:    name of group
                    // {threadName}: name of group
                    // {session}:    session of day
                    if (userName.length == 0) return;
                    let { welcomeMessage = getLang("defaultWelcomeMessage") } =
                        threadData.data;
                    const form = {
                        mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
                    };
                    welcomeMessage = welcomeMessage
                        .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
                        .replace(/\{boxName\}|\{threadName\}/g, threadName)
                        .replace(
                            /\{multiple\}/g,
                            multiple ? getLang("multiple2") : getLang("multiple1")
                        )
                        .replace(
                            /\{session\}/g,
                            hours <= 10
                                ? getLang("session1")
                                : hours <= 12
                                    ? getLang("session2")
                                    : hours <= 18
                                        ? getLang("session3")
                                        : getLang("session4")
                        );

                    form.body = welcomeMessage;

                    // Add image attachment
                    const imagePath = __dirname + "/image.jpg"; // Replace with your image path
                    if (fs.existsSync(imagePath)) {
                        form.attachment = fs.createReadStream(imagePath);
                    }

                    message.send(form);
                    delete global.temp.welcomeEvent[threadID];
                }, 1500);
            };
        }
    }
};