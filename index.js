const Discord = require('discord.js');
const Timer = require('timer.js');
const bot = new Discord.Client();
const PREFIX = '%';
const ERRNOusage = 2;
const ERRNOemptyVars = 3;
const ERRNOperms = 4;
// bot.registry.registerGroup('random', 'Random');
// bot.registry.registerDefaults();
// bot.registry.registerCommandsIn(__dirname + "/commands");
var memberRole = null;
var additionalRole = null;
var filteredChannel;
var notifChannel = null;
var welcomerRole = null;
var dyskoCounter = 0;
var prevHMM = false;
var prevMGS = false;
//All outcomes should end with "for " or "in ". The comma is for the name of the silenced
var silencioOutcomes = [
    ['A sandal flies out of nowhere and strikes ',' in the jaw, rendering him/her unable to speak for '],
    ['While attempting to use Tatsumaki Bot to fish, ',' accidentally hooked his/her lips shut for '],
    ['I cast a spell on ',', and his/her mouth turns into a butthole. The spell will wear off in '],
    ['Oops. I accidentally deleted ','\'s mouth. It\'ll come back in '],
    ['Moobot from Twitch sends his regards. ',', your timeout ends in '],
    ['A flower is pissed at your recent actions. It wrapped its leaves around ', '\'s mouth. I believe it will calm down in ']
];

var dyskoOptions = [
    'Yeah, what Dysko said.',
    'Whatever you say, Dysko',
    'Tell it like it is, Dysko',
    'I was gonna say that, Dysko',
    'Smh Dysko stop predicting what I was going to say'
]
function silencio(guild, userid){
    var allChannels = guild.channels.array();
    for(i = 0; i < allChannels.length; ++i){
        allChannels[i].overwritePermissions(
            userid,
            {
                SEND_MESSAGES: false
            }
        );
    }
}

function unsilence(guild, userid){
    var allChannels = guild.channels.array();
    for(i = 0; i < allChannels.length; ++i){
        allChannels[i].overwritePermissions(
            userid,
            {
                SEND_MESSAGES: null
            }
        );
    }
}

bot.on('message', (message) =>{
    if(message.content.startsWith(PREFIX)){
        var s = message.content.split(' ');
        if(s[0] == '%SILENCIO'){
            if (message.channel.permissionsFor(message.author).has("KICK_MEMBERS")) {
                try{
                    if(!(s[2].startsWith('<') && s[2].endsWith('>')) || s.length != 3){
                        throw ERRNOusage;
                    }
                    if(!(0<s[1]&&s[1]<61)){
                        throw 1;
                    }
                    if(message.mentions.members.first().id == '131622469512593408'){
                        throw 6969;
                    }
                    var timeoutTimer = new Timer(
                        {
                            onstart: function() {silencio(message.guild, message.mentions.members.first().id)},
                            onend: function() {unsilence(message.guild, message.mentions.members.first().id)}
                        }
                    );
                    var timeout = s[1]*60;
                    timeoutTimer.start(timeout);
                    var rand = Math.floor(Math.random()*silencioOutcomes.length);
                    var smite = silencioOutcomes[rand][0] + 
                        s[2] + 
                        silencioOutcomes[rand][1] +
                        s[1] +
                        " minute";
                    if(s[1] != 1){
                        smite += "s.";
                    }
                    else{
                        smite += ".";
                    }
                    message.channel.send(s[2] + ", SILENCIO!");
                    message.channel.send(smite);
                    message.delete();
                } catch(e){
                    if(e == 1){
                        message.channel.send('Invalid amount of time').then(message => {
                            message.delete(4000);
                        });
                    }
                    else if(e == ERRNOusage){
                        message.channel.send("Usage is: %SILENCIO [time(min)] [Tag user]").then(message => {
                            message.delete(4000);
                        });
                    }
                    else if(e == 6969){
                        message.channel.send("You can't just silence my creator like that. Try this command: \"%silencecreator\"");
                    }
                    
                    message.delete();
                }
            } else {
                message.reply(
                    "You must construct additional pylons to use this command."
                );
            }
        }
        else if(s[0] == '%silencio'){
            message.reply("You're not gonna silence anyone with that kind of voice.");
            // if(message.author.id == '336356363661737984'){
            //     message.channel.send('FUCK');
            // }
        }
        else if(s[0] == '%unsilence'){
            if (message.channel.permissionsFor(message.author).has("KICK_MEMBERS")) {
                try{
                    if(s.length != 2 || !(s[1].startsWith('<') && s[1].endsWith('>'))){
                        throw ERRNOusage;
                    }
                    unsilence(message.guild, message.mentions.members.first().id);
                }
                catch(e){
                    if(e == ERRNOusage){
                        message.channel.send("Usage is %unsilence [Tag User]").then(message => {
                            message.delete(4000);
                        });
                    }
                    
                    message.delete();
                }
            }
        }
        else if(s[0] == '%approve'){
            try{
                if(!(s.length == 2 || s.length == 3) || !(s[1].startsWith('<') && s[1].endsWith('>'))){
                    throw ERRNOusage;
                }
                if(memberRole == null || notifChannel == null || welcomerRole == null){
                    throw ERRNOemptyVars;
                }
                let mem = message.mentions.members.first();
                mem.addRole(memberRole).catch(console.error);
                if(s.length == 3 && additionalRole != null){
                    if(s[2] == 'y' || s[2] == 'Y' || s[2] == 'yes' || s[2] == 'Yes' || s[2] == 'YES'){
                        mem.addRole(additionalRole).catch(console.error);
                    }
                }
                notifChannel.send(
                    "<@&" + welcomerRole.id + "> " + 
                    message.mentions.members.first().displayName +
                    " has been approved."
                );
                message.delete();
            }
            catch(e){
                if(e == ERRNOusage){
                    message.channel.send("Usage is %approve [Tag User] [(optional role) y/n]").then(message => {
                        message.delete(4000);
                    });
                }
                if(e == ERRNOemptyVars){
                    message.channel.send("Roles and channels not set.").then(message => {
                        message.delete(4000);
                    });
                }
                message.delete();
            }
        }
        //Next 5 commands are to set variables in the approve command.
        else if(s[0] == '%adminSetApproveAll'){
            try{
                if(!message.member.hasPermission("MANAGE_GUILD")){
                    throw ERRNOperms;
                }
                if(s.length != 4){
                    throw ERRNOusage;
                }
                memberRole = message.guild.roles.find("name", s[1]);
                additionalRole = message.guild.roles.find("name", s[2]);
                welcomerRole = message.guild.roles.find("name", s[3]);
                notifChannel = message.channel;

                message.delete();
            }
            catch(e){
                if(e == ERRNOperms){
                    message.channel.send("Invalid Permissions").then(message => {
                        message.delete(4000);
                    });
                }
                else{
                    message.channel.send("Usage is %adminSetMemberRole [member] [additional] [welcomer]").then(message => {
                        message.delete(4000);
                    });
                }
                message.delete();
            }
        }
        else if(s[0] == '%adminSetMemberRole'){
            try{
                if(!message.member.hasPermission("MANAGE_GUILD")){
                    throw ERRNOperms;
                }
                if(s.length != 2){
                    throw ERRNOusage;
                }
                memberRole = message.guild.roles.find("name", s[1]);
                message.delete();
            }
            catch(e){
                if(e == ERRNOperms){
                    message.channel.send("Invalid Permissions").then(message => {
                        message.delete(4000);
                    });
                }
                else{
                    message.channel.send("Usage is %adminSetMemberRole [roleName]").then(message => {
                        message.delete(4000);
                    });
                }
                message.delete();
            }
        }
        else if(s[0] == '%adminSetAdditionalRole'){
            try{
                if(!message.member.hasPermission("MANAGE_GUILD")){
                    throw ERRNOperms;
                }
                if(s.length != 2){
                    throw ERRNOusage;
                }
                additionalRole = message.guild.roles.find("name", s[1]);
                message.delete();
            }
            catch(e){
                if(e == ERRNOperms){
                    message.channel.send("Invalid Permissions").then(message => {
                        message.delete(4000);
                    });
                }
                else{
                    message.channel.send("Usage is %adminSetAdditionalRole [roleName]").then(message => {
                        message.delete(4000);
                    });
                }
                message.delete();
            }
        }    
        else if(s[0] == '%adminSetNotificationChannel'){
            try{
                if(!message.member.hasPermission("MANAGE_GUILD")){
                    throw ERRNOperms;
                }
                if(s.length != 1){
                    throw ERRNOusage;
                }
                notifChannel = message.channel;
                message.delete();
            }
            catch(e){
                if(e == ERRNOperms){
                    message.channel.send("Invalid Permissions").then(message => {
                        message.delete(4000);
                    });
                }
                else{
                    message.channel.send("Usage is %adminSetNotificationChannel").then(message => {
                        message.delete(4000);
                    });
                }
                
                message.delete();
            }
        }
        else if(s[0] == '%adminSetWelcomerRole'){
            try{
                if(!message.member.hasPermission("MANAGE_GUILD")){
                    throw ERRNOperms;
                }
                if(s.length != 2){
                    throw ERRNOusage;
                }
                welcomerRole = message.guild.roles.find("name", s[1]);
                message.delete();
            }
            catch(e){
                if(e == ERRNOperms){
                    message.channel.send("Invalid Permissions").then(message => {
                        message.delete(4000);
                    });
                }
                else{
                    message.channel.send("Usage is %adminSetWelcomerRole [roleName]").then(message => {
                        message.delete(4000);
                    });
                }
                message.delete();
            }
        }
        else if(s[0] == '%adminCheckVars'){
            console.log(memberRole.name);
            console.log(additionalRole.name);
            console.log(notifChannel.name);
            console.log(welcomerRole.name);
            message.delete();
        }
        else if(s[0] == '%adminSetChannelFilter'){
            message.channel.send("Not implemented yet.").then(message => {
                message.delete(4000);
            });
            //TODO 
        }
        else if(s[0] == '%mod'){
            message.channel.send("Fun Fact: Did you know that there is a .0000001% chance of becoming moderator with this command?");
        }
        else if(s[0] == '%silencecreator'){
            message.channel.send(
                "HAHA! You actually thought that would work?\nMaybe try looking at the ceiling. I heard the word \"GULLIBLE\" was written on it."
            );
        }
        else if(s[0] == '%dysko'){
            message.channel.send(dyskoCounter).then(message => {
                message.delete(4000);
            });
            message.delete();
        }
    }
    else if(message.author.id == '125810616169529344'){
        if(message.content.length > 10){
            if(dyskoCounter >= 10){
                let rand = Math.floor(Math.random()*5);
                message.channel.send(dyskoOptions[rand]);
                dyskoCounter = 0;
            }
            else{
                ++dyskoCounter;
            }
        }
    }
    if(message.content.includes('<:hmm:317214770900238336>') && message.author.id != '336356363661737984'){
        if(prevHMM){
            message.channel.send('<:hmm:317214770900238336>');
            prevHMM = false;
        }
        else{
            prevHMM = true;
        }
    }
    else{
        prevHMM = false;
    }
    if(message.content == "!"){
        if(prevMGS){
            message.channel.send('!');
            prevMGS = false;
        }
        else{
            prevMGS = true;
        }
    }
    else{
        prevMGS = false;
    }
    if(message.author == '172002275412279296' && message.content.includes(':battery:')){
        message.channel.send('How did you manage to fish up a battery and not a fish? Batteries roll off the fishing hook.')
    }
    if(message.content.length > 25 && (message.content.includes('supreme') || message.content.includes('Supreme') || message.content.includes('SUPREME')) && message.author.id != '336356363661737984'){
        message.channel.send("I'm going to take your supreme, and shove it right up your ass.")
        message.channel.send('%silencio <@' + message.author.id + '>');
    }
    if(message.content.length > 20 && (message.content.includes('usidore') || message.content.includes('Usidore') || message.content.includes('USIDORE')) && message.author.id != '336356363661737984'){
        message.channel.send(
            "I AM USIDORE, Wizard of the 12th Realm of Ephysiyies, Master of Light and Shadow, Manipulator of Magical Delights, Devourer of Chaos, Champion of the Great Halls of Terr'akkas. The elves know me as Fi’ang Yalok. The dwarves know me as Zoenen Hoogstandjes. And I am also known in the Northeast as Gaismunēnas Meistar. And there are other secret names you do not know yet."
        );
    }
});

bot.login('MzM2MzU2MzYzNjYxNzM3OTg0.DE3pew.A1RVEnBz6nAtm8dx7EmL6LZ4FCk');
