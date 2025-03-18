const os = require('os');
const moment = require('moment-timezone');
const { createCanvas } = require('canvas');
const fs = require('fs');

module.exports = {
    config: {
        name: "uptime",
        aliases: ["upt", "up"],
        version: "1.0",
        author: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝐗𝐄 3.0★彡",
        role: 0,
        shortDescription: {
            en: "Displays bot uptime, system information, and current time in Cameroon."
        },
        longDescription: {
            en: "Displays bot uptime, system information, CPU speed, storage usage, RAM usage, and current time in Cameroon."
        },
        category: "system",
        guide: {
            en: "Use {p}uptime to display bot uptime, system information, and current time in Cameroon."
        }
    },
    onStart: async function ({ api, event, prefix }) {
        try {
            const botUptime = process.uptime();
            const serverUptime = os.uptime(); // Get server uptime

            // Format bot uptime
            const botDays = Math.floor(botUptime / 86400);
            const botHours = Math.floor((botUptime % 86400) / 3600);
            const botMinutes = Math.floor((botUptime % 3600) / 60);
            const botSeconds = Math.floor(botUptime % 60);

            const botUptimeString = `${botDays} days, ${botHours} hours, ${botMinutes} minutes, ${botSeconds} seconds`;

            // Format server uptime
            const serverDays = Math.floor(serverUptime / 86400);
            const serverHours = Math.floor((serverUptime % 86400) / 3600);
            const serverMinutes = Math.floor((serverUptime % 3600) / 60);
            const serverSeconds = Math.floor(serverUptime % 60);

            const serverUptimeString = `${serverDays} days, ${serverHours} hours, ${serverMinutes} minutes, ${serverSeconds} seconds`;

            const totalMem = os.totalmem() / (1024 * 1024 * 1024);
            const freeMem = os.freemem() / (1024 * 1024 * 1024);
            const usedMem = totalMem - freeMem;
            const speed = os.cpus()[0].speed;

            const systemStatus = "🟢 Good System";

            // Set timezone to Cameroon (Africa/Douala)
            const cameroonTimezone = 'Africa/Douala';
            const now = moment().tz(cameroonTimezone);
            const currentTime = now.format('YYYY-MM-DD HH:mm:ss');

            // Create an image with the information
            const canvas = createCanvas(800, 600);
            const ctx = canvas.getContext('2d');

            // Draw background with fluorescent color
            ctx.fillStyle = '#0f0f0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw text with fluorescent colors
            const textColors = ['#00ff00', '#ff00ff', '#00ffff', '#ffff00'];
            const texts = [
                `Bot Uptime: ${botUptimeString}`,
                `Server Uptime: ${serverUptimeString}`,
                `CPU Speed: ${speed} MHz`,
                `Memory Usage: Used: ${usedMem.toFixed(2)} GB / Total: ${totalMem.toFixed(2)} GB`,
                `Current Time in Cameroon: ${currentTime}`,
                systemStatus
            ];

            ctx.font = '30px Arial';
            texts.forEach((text, index) => {
                ctx.fillStyle = textColors[index % textColors.length];
                ctx.fillText(text, 50, 50 + index * 50);
            });

            // Save the image
            const buffer = canvas.toBuffer('image/png');
            const imagePath = './uptime.png';
            fs.writeFileSync(imagePath, buffer);

            // Send the image
            api.sendMessage({ body: 'Here is the uptime information:', attachment: fs.createReadStream(imagePath) }, event.threadID);

        } catch (error) {
            console.error(error);
            api.sendMessage(`🔴 Bad System: An error occurred while retrieving data. ${error.message}`, event.threadID);

            if (module.exports.config.author !== "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝐗𝐄 3.0★彡") {
                return api.sendMessage("❌ Tant que vous n'aurez pas remis le nom du créateur de cette commande... celle-ci cessera de fonctionner !🛠️⚙️", event.threadID);
            }
        }
    }
};