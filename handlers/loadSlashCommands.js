
async function loadSlashCommands(client) {
const fetch = require('node-fetch')
const { ApplicationCommandOptionType } = require('discord.js')
  const mongoose = require("mongoose")
     mongoose.connect(`mongodb+srv://SpiralSafe:VLnBBmxYz6KYnrPU@cluster0.ndzq3.mongodb.net/Bloxfruit`,{
  //   maxPoolSize: 100 * 10,
     autoIndex: true,
     serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
     }).catch((e) => {
console.log(`Database error ${e}`)
}).then(() => console.log('database connected'))
    /*.catch((e) => {
        console.error(e);
        // Always hard exit on a database connection error
      process.exit(1);
    });*/ 
    const fs = require("fs");
    const ascii = require("ascii-table");

    let slash = [];

    const table = new ascii().setHeading(" Slash Commands", "Load Status");
  
    const commandFolders = fs.readdirSync("./SlashCommands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./SlashCommands/${folder}`)
        .filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`../SlashCommands/${folder}/${file}`);
        if (command.name) {
          client.slash.set(command.name, command)
          slash.push(command)
          table.addRow(file, "✔️");
        } else {
          table.addRow(
            file,
            "❌ => Missing a help.name or help.name is not in string"
          );
          continue;
        }
      }
      console.log(table.toString());
    }
  
    client.on("ready", async() => {
      await client.application.commands.set(slash);
     

    })
  
  }

  module.exports = {
    loadSlashCommands,
  };
  