const prefixModel = require("../../database/main/prefix");
const Discord = require("discord.js");
const { Color } = require('../../config.json');
const  emoji  = require('../../emoji.json')

module.exports = {
  name: "prefix",
  description: "Change the prefix per server!",
  userPerms: ["ManageGuild"],
  aliases: ['setprefix', 'prefixset'],

  run: async (client, message, args) => {
    let interaction = message;
    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
    return   interaction.reply({
      embeds: [new Discord.EmbedBuilder()
        .setAuthor({ name: `${interaction.author.tag}`, iconURL:interaction.author?.displayAvatarURL({ dynamic: true }) || null })
          .setDescription(`> ${emoji.error} ${message.author}: You're missing the \`Manage Guild\` permission`)
          .setColor(Color)
      ]
  });
    const data = await prefixModel.findOne({
      GuildID: message.guild.id,
    });

    if (!args[0])
    return message.reply({
        embeds: [new Discord.EmbedBuilder()
            .setDescription(`> ${emoji.error} ${message.author}: You did not provide any **argument(s)** to proceed.`)
            .setColor(Color)
        ]
    });
    if (args[0].length > 3)
    return message.reply({
        embeds: [new Discord.EmbedBuilder()
            .setDescription(`> ${emoji.error} ${message.author}: Prefixes can not be longer than **3 characters**.`)
            .setColor(Color)
        ]
    });

    if (data) {
      await prefixModel.findOneAndRemove({
        GuildID: message.guild.id,
      });

       message.reply({
        embeds: [new Discord.EmbedBuilder()
            .setDescription(`> ${emoji.success} ${message.author}: Updated prefix to **${args[0]}**.`)
            .setColor(Color)
        ]
    });
      let newData = new prefixModel({
        Prefix: args[0],
        GuildID: message.guild.id,
      });
      newData.save();
    } else if (!data) {
         message.reply({
            embeds: [new Discord.EmbedBuilder()
              .setColor(Color)

        .setDescription(`> ${emoji.success} ${message.author}: The new prefix has been set to **${args[0]}**.`)
    ]
});
      let newData = new prefixModel({
        Prefix: args[0],
        GuildID: message.guild.id,
      });
      newData.save();
    }
  },
};