const { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, SelectMenuBuilder, ButtonStyle, ButtonBuilder, EmbedBuilder } = require('discord.js');
let MessageActionRow = ActionRowBuilder;
let MessageEmbed = EmbedBuilder;
let MessageButton = ButtonBuilder;
const Discord = require('discord.js')
const emoji = require("../../emoji.json") 
const StickyDB = require("../../database/main/sticky");
const { Color}  = require(`../../config.json`);
module.exports = {
  name: "sticky",
  description: "Set up a sticky message in one or multiple channels",
  permission: "MANAGE_MESSAGES",
  permissions: [`Manage Messages`,],
type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "create",
      description: "Creates a new sticky message.",
    type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "Choose a channel you wish to apply the sticky message to.",
      type: ApplicationCommandOptionType.Channel,
          required: true
        },
        {
            name: "threshold",
            description: "Enter the threshold for when the sticky message should be resent.",
           type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "text",
            description: "Enter the text you wish to add to the sticky message.",
       type: ApplicationCommandOptionType.String,
            required: true,
        },
      ],
    },
    {
      name: "remove",
      description: "Delete sticky messages.",
         type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "A channel you wish to delete a sticky message from.",
       type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
    {
        name: "list",
        description: "Lists all sticky messages applied to this server.",
            type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  /**
   * 
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
    run: async(client, interaction, args) => {
        let message = interaction;
        interaction.user = message.author;
    const { member, guildId } = interaction;
    function isStringNotInArray(value, stringArray) {
        return stringArray.includes(value);
      }
      //console.log(isStringNotInArray("banana", words)); // false ("banana" is in the array)
      
      let options = ['create', 'remove', 'list',]
      if(!isStringNotInArray(args[0], options) && args[0] || !args[0]) {
          return message.channel.send({
              embeds: [new Discord.EmbedBuilder()
                  .setDescription(`${emoji.error} ${message.author}: Incorrect **options** provided.`)
                  .setColor(Color)
                  .addFields({
                      name: 'Options',
                      value: `${options.join('\n')}`,
                      inline: true,
                  })
              ]
            });
      }
    const { PermissionsBitField } = require('discord.js')
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
    return interaction.channel.send({ ephemeral: true,
    embeds: [
    {
    color: 0x6787e7,
    author: {
    name: `${interaction.user.tag}`,
    icon_url: `${interaction.user?.displayAvatarURL({ dynamic: true })}`,
    
    },
    // footer: { icon_url: client.user.displayAvatarURL() },
    footer: {
    text: `${client.user.username}`,
    icon_url: `${client.user.displayAvatarURL()}`,
    },
    
    description: `${emoji.error} You're missing the \`MANAGE_GUILD\` permission`,
    timestamp: new Date(),
    },
    ],
    });
    const Embed = new MessageEmbed();
    Embed.setColor(Color);

    let Channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;
    if (!Channel || Channel.type === Discord.ChannelType.GuildVoice)
    return   message.channel.send({
     embeds: [new Discord.EmbedBuilder()
       .setAuthor({ name: `${interaction.author.tag}`, iconURL:interaction.author?.displayAvatarURL({ dynamic: true }) || null })
         .setDescription(`> ${emoji.error} ${message.author}: Channel should be a **text channel**.`)
         .setColor(Color)
     ]
    });
    const Content = args.slice(3).join(' ');
    let Threshold = Number(args[2], 10);

    try {
      switch(args[0]) {
        case "create": 
        if(!Threshold || !Content || !args[1]) {
          return message.channel.send({
              embeds: [new Discord.EmbedBuilder()
                  .setDescription(`${emoji.error} ${message.author}: Incorrect **usage**.\n\`\`\`$sticky create <#channel> <thresold> <content> \`\`\``)
                  .setColor(Color)
                  .addFields({
                      name: 'Options',
                      value: `${options.join('\n')}`,
                      inline: true,
                  })
              ]
            });
      }
        StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id }, async (err, data) => {
          if (err) throw err;
          if(data) {
          return interaction.channel.send({ embeds: [Embed.setDescription(`${emoji.error} You already have a **sticky message** on ${Channel}.`)]})
        } else {
            StickyDB.create({
            GuildID: guildId,
            ChannelID: Channel.id,
            Message: Content,
            Threshold: Threshold -1,
            CreatedBy: member.id,
            MessageCount: 0,
          });

         Embed.setDescription(`${emoji.success} **added** the sticky message.`)
         Embed.addFields(
            { name: "Channel", value: `${Channel}`, inline: true },
            { name: "Message Threshold", value: `${Threshold}`, inline: true },
            { name: "Message", value: `${Content}` })
        interaction.channel.send({
          embeds: [Embed], ephemeral: true
        });
        Channel.send({ embeds: [new EmbedBuilder().setDescription(`${Content}`)] }).then(async (stickmsg) => {
          const DB = await StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id })
          DB.Lastmsg = stickmsg.id;
          DB.save();
        })
        }})
        break;

        case "remove":
        StickyDB.findOne({ GuildID: guildId, ChannelID: Channel.id }, async(err, data) => {
          if (err) throw err;
          if (data) {
            await StickyDB.deleteOne({ GuildID: guildId, ChannelID: Channel.id })
              interaction.channel.send({ embeds: [Embed.setDescription(`${emoji.success} The sticky message on ${Channel} has been **deleted**.`)], ephemeral: true })
          } else {
            interaction.channel.send({ embeds: [Embed.setDescription(`${emoji.error} There was not any **sticky** added on ${Channel}.`)], ephemeral: true })
          }
        })
        break;

        case "list":
          const backId = 'back'
          const forwardId = 'forward'
          const backButton = new ButtonBuilder({
            style: ButtonStyle.Secondary,
            label: 'Back',
          
            customId: backId
          })
          const forwardButton = new ButtonBuilder({
            style: ButtonStyle.Secondary,
            label: 'Forward',
          
            customId: forwardId
          });
            
                 let Database = await StickyDB.find({ 
                  GuildID: guildId, }).exec(async (err, res) => {
                   let g = interaction.guild;
                //if database not found
                if (!res || !res.length) { 
                  
                  
                  return interaction.channel.send(`${emoji.error} No sticky data was found.`)
          
                } 
              
                let array = [];
          
                
                for (i = 0; i < res.length; i++) {
                array.push(`\`${i + 1}.\` **Channel**: <#${res[i].ChannelID || 'N/A'}>
                ┣ Thresold: \`${res[i].Threshold || 'N/A'}\`
                ┣ Creator: <@${res[i].CreatedBy}>
                ┗ Text:\n\`\`\`${res[i].Message || 'N/A'}\`\`\``);
        
                }
           const interval = 10;
          
          
           
              const range = (array.length == 1) ? '[1]' : `[1 - ${array.length}]`;
          let guilds = array;
                const generateEmbed = async start => {
            const current = array.slice(start, start + 5)
          
            // You can of course customise this embed however you want
            return new EmbedBuilder({
             author: { 
               name: `${g.name}`,
              iconURL: g?.iconURL({dyanmic: true}),
             },
              thumbnail: {
                 url: g?.iconURL({ size: 4096, dyanmic: true}),
            
              },
              
              description: `${current.join(`\n`)}`,
              
              color: 0x2e3135,
            })
                };
              
          // Send the embed with the first 10 guilds
          const canFitOnOnePage = guilds.length <= 5
          const embedMessage = await interaction.channel.send({
            embeds: [await generateEmbed(0)],
            components: canFitOnOnePage
              ? []
              : [new ActionRowBuilder({components: [forwardButton]})]
          })
          // Exit if there is only one page of guilds (no need for all of this)
          if (canFitOnOnePage) return;
          
          // Collect button interactions (when a user clicks a button),
          // but only when the button as clicked by the original message author
          const collector = embedMessage.createMessageComponentCollector({
            filter: ({user}) => user.id === interaction.user.id
          })
          
          let currentIndex = 0
          collector.on('collect', async interaction => {
            // Increase/decrease index
            interaction.customId === backId ? (currentIndex -= 5) : (currentIndex += 5)
            // Respond to interaction by updating message with new embed
            await interaction.update({
              embeds: [await generateEmbed(currentIndex)],
              components: [
                new MessageActionRow({
                  components: [
                    // back button if it isn't the start
                    ...(currentIndex ? [backButton] : []),
                    // forward button if it isn't the end
                    ...(currentIndex + 5 < guilds.length ? [forwardButton] : [])
                  ]
                })
              ]
            })
            
                 })
                                        
            })
      }
    } catch (err) {
      console.log(err)
    }
  },
};