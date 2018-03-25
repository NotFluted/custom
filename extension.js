/**
 robert 

 Copyright © 2017-2018 Fluted 

 Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.

 Source repo: basicBot
 
 */

(function() {

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem('robertRoom'));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        clearInterval(robert.room.autodisableInterval);
        clearInterval(robert.room.afkInterval);
        robert.status = false;
    };

    // This socket server is used solely for statistical and troubleshooting purposes.
    // This server may not always be up, but will be used to get live data at any given time.

    /*
    var socket = function() {
        function loadSocket() {
            SockJS.prototype.msg = function(a) {
                this.send(JSON.stringify(a))
            };
            sock = new SockJS('https://benzi.io:4964/socket');
            sock.onopen = function() {
                console.log('Connected to socket!');
                sendToSocket();
            };
            sock.onclose = function() {
                console.log('Disconnected from socket, reconnecting every minute ..');
                var reconnect = setTimeout(function() {
                    loadSocket()
                }, 60 * 1000);
            };
            sock.onmessage = function(broadcast) {
                var rawBroadcast = broadcast.data;
                var broadcastMessage = rawBroadcast.replace(/["\\]+/g, '');
                API.chatLog(broadcastMessage);
                console.log(broadcastMessage);
            };
        }
        if (typeof SockJS == 'undefined') {
            $.getScript('https://cdn.jsdelivr.net/sockjs/1.0.3/sockjs.min.js', loadSocket);
        } else loadSocket();
    }

    var sendToSocket = function() {
        var robertSettings = robert.settings;
        var robertRoom = robert.room;
        var robertInfo = {
            time: Date.now(),
            version: robert.version
        };
        var data = {
            users: API.getUsers(),
            userinfo: API.getUser(),
            room: location.pathname,
            robertSettings: robertSettings,
            robertRoom: robertRoom,
            robertInfo: robertInfo
        };
        return sock.msg(data);
    };
    */

    var storeToStorage = function() {
        localStorage.setItem("robertsettings", JSON.stringify(robert.settings));
        localStorage.setItem("robertRoom", JSON.stringify(robert.room));
        var robertStorageInfo = {
            time: Date.now(),
            stored: true,
            version: robert.version
        };
        localStorage.setItem("robertStorageInfo", JSON.stringify(robertStorageInfo));
    };

    var subChat = function(chat, obj) {
        if (typeof chat === 'undefined') {
            API.chatLog('There is a chat text missing.');
            console.log('There is a chat text missing.');
            return '[Error] No text message found.';

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function(cb) {
        if (!cb) cb = function() {};
        $.get("https://rawgit.com/NotFluted/robert/master/lang/langindex.json", function(json) {
            var link = robert.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[robert.settings.language.toLowerCase()];
                if (robert.settings.chatLink !== robert.chatLink) {
                    link = robert.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = robert.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        robert.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(robert.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        robert.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem("robertsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                robert.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem("robertStorageInfo");
        if (info === null) API.chatLog(robert.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("robertsettings"));
            var room = JSON.parse(localStorage.getItem("robertRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(robert.chat.retrievingdata);
                for (var prop in settings) {
                    robert.settings[prop] = settings[prop];
                }
                robert.room.users = room.users;
                robert.room.afkList = room.afkList;
                robert.room.historyList = room.historyList;
                robert.room.mutedUsers = room.mutedUsers;
                //robert.room.autoskip = room.autoskip;
                robert.room.roomstats = room.roomstats;
                robert.room.messages = room.messages;
                robert.room.queue = room.queue;
                robert.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(robert.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById('room-settings');
        info = roominfo.textContent;
        var ref_bot = '@robert | Bot=';
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(' ') < link.indexOf('\n')) ind_space = link.indexOf(' ');
            else ind_space = link.indexOf('\n');
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== 'undefined') {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        robert.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = "Fluted";
    var botMaintainer = "Fluted";
    var botCreatorIDs = "4329931";
    var resdjs = ["",""];
    var bouncers = ["",""];
    var managers = ["",""];
    var CoHosts = ["",""];
    var robert = {
        version: "2.14.5.6",
        status: true,
        name: "Robert",
        loggedInID: "33104203",
        scriptLink: "https://rawgit.com/NotFluted/robert/master/extension.js",
        cmdLink: "https://goo.gl/BX4kGw",
        chatLink: "https://rawgit.com/NotFluted/robert/master/lang/langindex.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Robert",
            language: "english",
            chatLink: "https://rawgit.com/NotFluted/robert/master/lang/langindex.json",
            scriptLink: "https://rawgit.com/NotFluted/robert/master/extension.js",
            roomLock: false, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: true, // true or false
            autowoot: true,
            autoskip: false,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: true,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: false,
            commandCooldown: 30,
            usercommandsEnabled: true,
            thorCommand: true,
            thorCooldown: 10,
            skipPosition: 3,
            skipReasons: [
                ["theme", "This song does not fit the room theme. Check the allowed themes by using !theme"],
                ["op", "This song is on the OP (Over Played) list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad/low sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 30,
            afkRankCheck: "ambassador",
            motdEnabled: true,
            motdInterval: 30,
            motd: "Heck. That really startled me and now I've forgotten what I was supposed to say :(",
            filterChat: true,
            etaRestriction: true,
            welcome: true,
            opLink: null,
            rulesLink: "https://goo.gl/yVZiZm",
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [
		    "None of us really know why you're here since this is a testing room.",
		    "Find an error with Robert? Let the developers know here: https://goo.gl/rjtvzc",
		    "Want to move up the waitlist? The room holds regular Roulette waitlist boosts! Don't forget to type in !join when the roulette is live.
	    ],
            messageInterval: 3,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                nsfw: 'https://rawgit.com/NotFluted/robert/master/blacklists/NSFWlist.json',
                op: 'https://rawgit.com/NotFluted/robert/master/blacklists/OPlist.json',
                banned: 'https://rawgit.com/NotFluted/robert/master/blacklists/BANNEDlist.json'
            }
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function() {
                if (robert.status && robert.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    robert.room.roulette.rouletteStatus = true;
                    robert.room.roulette.countdown = setTimeout(function() {
                        robert.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(robert.chat.isopen);
                },
                endRoulette: function() {
                    robert.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * robert.room.roulette.participants.length);
                    var winner = robert.room.roulette.participants[ind];
                    robert.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = robert.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(robert.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        robert.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: []
        },
        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = robert.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < robert.room.users.length; i++) {
                    if (robert.room.users[i].id === id) {
                        return robert.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < robert.room.users.length; i++) {
                    var match = robert.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return robert.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = robert.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) {
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                if (botCreatorIDs.indexOf(u.id) > -1) return 9999;

                if (u.gRole < 3000) return u.role;
                else {
                    switch (u.gRole) {
                        case 3000:
                            return (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        case 5000:
                            return (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = robert.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < robert.room.queue.id.length; i++) {
                            if (robert.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            robert.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(robert.chat.alreadyadding, {
                                position: robert.room.queue.position[alreadyQueued]
                            }));
                        }
                        robert.roomUtilities.booth.lockBooth();
                        if (priority) {
                            robert.room.queue.id.unshift(id);
                            robert.room.queue.position.unshift(pos);
                        } else {
                            robert.room.queue.id.push(id);
                            robert.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(robert.chat.adding, {
                            name: name,
                            position: robert.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = robert.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return robert.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(robert.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return robert.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (robert.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = robert.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(robert.chat.toolongago, {
                    name: robert.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = robert.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = robert.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(robert.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(robert.chat.valid, {
                    name: robert.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                robert.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case 'admin':
                        rankInt = 10;
                        break;
                    case 'ambassador':
                        rankInt = 7;
                        break;
                    case 'host':
                        rankInt = 5;
                        break;
                    case 'cohost':
                        rankInt = 4;
                        break;
                    case 'manager':
                        rankInt = 3;
                        break;
                    case 'bouncer':
                        rankInt = 2;
                        break;
                    case 'residentdj':
                        rankInt = 1;
                        break;
                    case 'user':
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!robert.roomUtilities.booth.locked);
                    robert.roomUtilities.booth.locked = false;
                    if (robert.settings.lockGuard) {
                        robert.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(robert.roomUtilities.booth.locked);
                        }, robert.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(robert.roomUtilities.booth.locked);
                    clearTimeout(robert.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function() {
                if (!robert.status || !robert.settings.afkRemoval) return void(0);
                var rank = robert.roomUtilities.rankToNumber(robert.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, robert.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = robert.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = robert.userUtilities.getUser(user);
                            if (rank !== null && robert.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = robert.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = robert.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > robert.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(robert.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(robert.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            robert.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(robert.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: robert.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                robert.room.queueable = false;

                if (waitlistlength == 50) {
                    robert.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    robert.room.skippable = false;
                    setTimeout(function() {
                        robert.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        robert.userUtilities.moveUser(id, robert.settings.skipPosition, false);
                        robert.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                robert.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(robert.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (robert.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            robert.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, robert.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (robert.settings.motdEnabled) interval = robert.settings.motdInterval;
                else interval = robert.settings.messageInterval;
                if ((robert.room.roomstats.songCount % interval) === 0 && robert.status) {
                    var msg;
                    if (robert.settings.motdEnabled) {
                        msg = robert.settings.motd;
                    } else {
                        if (robert.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = robert.room.roomstats.songCount % robert.settings.intervalMessages.length;
                        msg = robert.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in robert.settings.blacklists) {
                    robert.room.blacklists[bl] = [];
                    if (typeof robert.settings.blacklists[bl] === 'function') {
                        robert.room.blacklists[bl] = robert.settings.blacklists();
                    } else if (typeof robert.settings.blacklists[bl] === 'string') {
                        if (robert.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(robert.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    robert.room.blacklists[l] = list;
                                })
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(robert.room.newBlacklisted);
                } else {
                    console.log(robert.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < robert.room.newBlacklisted.length; i++) {
                    var track = robert.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function(chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();

            robert.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

            for (var i = 0; i < robert.room.users.length; i++) {
                if (robert.room.users[i].id === chat.uid) {
                    robert.userUtilities.setLastActivity(robert.room.users[i]);
                    if (robert.room.users[i].username !== chat.un) {
                        robert.room.users[i].username = chat.un;
                    }
                }
            }
            if (robert.chatUtilities.chatFilter(chat)) return void(0);
            if (!robert.chatUtilities.commandCheck(chat))
                robert.chatUtilities.action(chat);
        },
        eventUserjoin: function(user) {
            var known = false;
            var index = null;
            for (var i = 0; i < robert.room.users.length; i++) {
                if (robert.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                robert.room.users[index].inRoom = true;
                var u = robert.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            } else {
                robert.room.users.push(new robert.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < robert.room.users.length; j++) {
                if (robert.userUtilities.getUser(robert.room.users[j]).id === user.id) {
                    robert.userUtilities.setLastActivity(robert.room.users[j]);
                    robert.room.users[j].jointime = Date.now();
                }

            }

            if (botCreatorIDs.indexOf(user.id) > -1) {
              console.log(true);
                API.sendChat('@'+user.username+' '+':sparkles: :bow: :sparkles:');
            } else if (robert.settings.welcome && greet) {
              console.log(false);
              console.log(botCreatorIDs);
                welcomeback ?
                    setTimeout(function(user) {
                        API.sendChat(subChat(robert.chat.welcomeback, {
                            name: user.username
                        }));
                    }, 1 * 1000, user) :
                    setTimeout(function(user) {
                        API.sendChat(subChat(robert.chat.welcome, {
                            name: user.username
                        }));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function(user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < robert.room.users.length; i++) {
                if (robert.room.users[i].id === user.id) {
                    robert.userUtilities.updateDC(robert.room.users[i]);
                    robert.room.users[i].inRoom = true;
                    if (lastDJ == user.id) {
                        var user = robert.userUtilities.lookupUser(robert.room.users[i].id);
                        robert.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function(obj) {
            for (var i = 0; i < robert.room.users.length; i++) {
                if (robert.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        robert.room.users[i].votes.woot++;
                    } else {
                        robert.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();

            if (robert.settings.voteSkip) {
                if ((mehs - woots) >= (robert.settings.voteSkipLimit)) {
                    API.sendChat(subChat(robert.chat.voteskipexceededlimit, {
                        name: dj.username,
                        limit: robert.settings.voteSkipLimit
                    }));
                    if (robert.settings.smartSkip && timeLeft > timeElapsed) {
                        robert.roomUtilities.smartSkip();
                    } else {
                        API.moderateForceSkip();
                    }
                }
            }

        },
        eventCurateupdate: function(obj) {
            for (var i = 0; i < robert.room.users.length; i++) {
                if (robert.room.users[i].id === obj.user.id) {
                    robert.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function(obj) {
            if (robert.settings.autowoot) {
                $('#woot').click(); // autowoot
            }

            var user = robert.userUtilities.lookupUser(obj.dj.id)
            for (var i = 0; i < robert.room.users.length; i++) {
                if (robert.room.users[i].id === user.id) {
                    robert.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (robert.settings.songstats) {
                if (typeof robert.chat.songstatistics === 'undefined') {
                    API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'WOOTS' + lastplay.score.grabs + 'GRABS' + lastplay.score.negative + 'MEHS')
                } else {
                    API.sendChat(subChat(robert.chat.songstatistics, {
                        artist: lastplay.media.author,
                        title: lastplay.media.title,
                        woots: lastplay.score.positive,
                        grabs: lastplay.score.grabs,
                        mehs: lastplay.score.negative
                    }))
                }
            }
            robert.room.roomstats.totalWoots += lastplay.score.positive;
            robert.room.roomstats.totalMehs += lastplay.score.negative;
            robert.room.roomstats.totalCurates += lastplay.score.grabs;
            robert.room.roomstats.songCount++;
            robert.roomUtilities.intervalMessage();
            robert.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function() {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in robert.room.blacklists) {
                    if (robert.settings.blacklistEnabled) {
                        if (robert.room.blacklists[bl].indexOf(mid) > -1) {
                            API.sendChat(subChat(robert.chat.isblacklisted, {
                                blacklist: bl
                            }));
                            if (robert.settings.smartSkip) {
                                return robert.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function() {
                if (robert.settings.timeGuard && newMedia.duration > robert.settings.maximumSongLength * 60 && !robert.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(robert.chat.timelimit, {
                        name: name,
                        maxlength: robert.settings.maximumSongLength
                    }));
                    if (robert.settings.smartSkip) {
                        return robert.roomUtilities.smartSkip();
                    } else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function() {
                if (format == 1) {
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function(track) {
                        if (typeof(track.items[0]) === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(robert.chat.notavailable, {
                                name: name
                            }));
                            if (robert.settings.smartSkip) {
                                return robert.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                } else {
                    var checkSong = SC.get('/tracks/' + cid, function(track) {
                        if (typeof track.title === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(robert.chat.notavailable, {
                                name: name
                            }));
                            if (robert.settings.smartSkip) {
                                return robert.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
            }, 2000);
            clearTimeout(historySkip);
            if (robert.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function() {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            robert.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(robert.chat.songknown, {
                                name: name
                            }));
                            if (robert.settings.smartSkip) {
                                return robert.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        robert.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(robert.chat.permissionownsong, {
                    name: user.username
                }));
                user.ownSong = false;
            }
            clearTimeout(robert.room.autoskipTimer);
            if (robert.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                robert.room.autoskipTimer = setTimeout(function() {
                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();
            //sendToSocket();
        },
        eventWaitlistupdate: function(users) {
            if (users.length < 50) {
                if (robert.room.queue.id.length > 0 && robert.room.queueable) {
                    robert.room.queueable = false;
                    setTimeout(function() {
                        robert.room.queueable = true;
                    }, 500);
                    robert.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function() {
                            id = robert.room.queue.id.splice(0, 1)[0];
                            pos = robert.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function(id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    robert.room.queueing--;
                                    if (robert.room.queue.id.length === 0) setTimeout(function() {
                                        robert.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + robert.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = robert.userUtilities.lookupUser(users[i].id);
                robert.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function(chat) {
            if (!robert.settings.filterChat) return false;
            if (robert.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(robert.chat.caps, {
                    name: chat.un
                }));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(robert.chat.askskip, {
                    name: chat.un
                }));
                return true;
            }
            for (var j = 0; j < robert.chatUtilities.spam.length; j++) {
                if (msg === robert.chatUtilities.spam[j]) {
                    API.sendChat(subChat(robert.chat.spam, {
                        name: chat.un
                    }));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function(chat) {
                var msg = chat.message;
                var perm = robert.userUtilities.getPermission(chat.uid);
                var user = robert.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < robert.room.mutedUsers.length; i++) {
                    if (robert.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (robert.settings.lockdownEnabled) {
                    if (perm === API.ROLE.NONE) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (robert.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (robert.settings.cmdDeletion && msg.startsWith(robert.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === API.ROLE.NONE) {
                        API.sendChat(subChat(robert.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(robert.chat.adfly, {
                        name: chat.un
                    }));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = robert.chat.roulettejoin;
                var rlLeaveChat = robert.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === robert.loggedInID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function(chat) {
                var cmd;
                if (chat.message.charAt(0) === robert.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    } else cmd = chat.message.substring(0, space);
                } else return false;
                var userPerm = robert.userUtilities.getPermission(chat.uid);
                //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                if (chat.message !== robert.settings.commandLiteral + 'join' && chat.message !== robert.settings.commandLiteral + 'leave') {       
                    if (userPerm === API.ROLE.NONE && !robert.room.usercommand) return void(0);
                    if (!robert.room.allcommand) return void(0);
                }
                if (chat.message === robert.settings.commandLiteral + 'eta' && robert.settings.etaRestriction) {
                    if (userPerm < API.ROLE.BOUNCER) {
                        var u = robert.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        } else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in robert.commands) {
                    var cmdCall = robert.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (robert.settings.commandLiteral + cmdCall[i] === cmd) {
                            robert.commands[comm].functionality(chat, robert.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === API.ROLE.NONE) {
                    robert.room.usercommand = false;
                    setTimeout(function() {
                        robert.room.usercommand = true;
                    }, robert.settings.commandCooldown * 1000);
                }
                if (executed) {
                    /*if (robert.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //robert.room.allcommand = false;
                    //setTimeout(function () {
                    robert.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function(chat) {
                var user = robert.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < robert.room.users.length; j++) {
                        if (robert.userUtilities.getUser(robert.room.users[j]).id === chat.uid) {
                            robert.userUtilities.setLastActivity(robert.room.users[j]);
                        }

                    }
                }
                robert.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'nibba', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function() {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function() {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function() {
            var u = API.getUser();
            if (robert.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(robert.chat.greyuser);
            if (robert.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(robert.chat.bouncer);
            robert.connectAPI();
            API.moderateDeleteChat = function(cid) {
                $.ajax({
                    url: '/_/chat/' + cid,
                    type: 'DELETE'
                })
            };

            robert.room.name = window.location.pathname;
            var Check;

            console.log(robert.room.name);

            var detect = function() {
                if (robert.room.name != window.location.pathname) {
                    console.log('Killing bot after room change.');
                    storeToStorage();
                    robert.disconnectAPI();
                    setTimeout(function() {
                        kill();
                    }, 1000);
                    if (robert.settings.roomLock) {
                        window.location = robert.room.name;
                    } else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function() {
                detect()
            }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = robert;
            robert.roomUtilities.updateBlacklists();
            setInterval(robert.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            robert.getNewBlacklistedSongs = robert.roomUtilities.exportNewBlacklistedSongs;
            robert.logNewBlacklistedSongs = robert.roomUtilities.logNewBlacklistedSongs;
            if (robert.room.roomstats.launchTime === null) {
                robert.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < robert.room.users.length; j++) {
                robert.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < robert.room.users.length; j++) {
                    if (robert.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    robert.room.users[ind].inRoom = true;
                } else {
                    robert.room.users.push(new robert.User(userlist[i].id, userlist[i].username));
                    ind = robert.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(robert.room.users[ind].id) + 1;
                robert.userUtilities.updatePosition(robert.room.users[ind], wlIndex);
            }
            robert.room.afkInterval = setInterval(function() {
                robert.roomUtilities.afkCheck()
            }, 10 * 1000);
            robert.room.autodisableInterval = setInterval(function() {
                robert.room.autodisableFunc();
            }, 60 * 60 * 1000);
            robert.loggedInID = API.getUser().id;
            robert.status = true;
            API.sendChat('/cap ' + robert.settings.startupCap);
            API.setVolume(robert.settings.startupVolume);
            if (robert.settings.autowoot) {
                $('#woot').click();
            }
            if (robert.settings.startupEmoji) {
                var emojibuttonoff = $('.icon-emoji-off');
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            } else {
                var emojibuttonon = $('.icon-emoji-on');
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + robert.settings.startupCap);
            API.chatLog('Volume set to ' + robert.settings.startupVolume);
            //socket();
            loadChat(API.sendChat(subChat(robert.chat.online, {
                botname: robert.settings.botName,
                version: robert.version
            })));
        },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = robert.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'host':
                        minPerm = API.ROLE.HOST;
                        break;
                    case 'cohost':
                        minPerm = API.ROLE.COHOST;
                        break;
                    case 'manager':
                        minPerm = API.ROLE.MANAGER;
                        break;
                    case 'mod':
                        if (robert.settings.bouncerPlus) {
                            minPerm = API.ROLE.BOUNCER;
                        } else {
                            minPerm = API.ROLE.MANAGER;
                        }
                        break;
                    case 'bouncer':
                        minPerm = API.ROLE.BOUNCER;
                        break;
                    case 'residentdj':
                        minPerm = API.ROLE.DJ;
                        break;
                    case 'user':
                        minPerm = API.ROLE.NONE;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },

            /*
            command: {
                command: 'cmd',
                rank: 'user/bouncer/mod/manager',
                type: 'startsWith/exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {

                    }
                }
            },
            */

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = robert.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(robert.chat.invalidtime, {
                                name: chat.un
                            }));
                        }
                        for (var i = 0; i < robert.room.users.length; i++) {
                            userTime = robert.userUtilities.getLastActivity(robert.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(robert.chat.activeusersintime, {
                            name: chat.un,
                            amount: chatters,
                            time: time
                        }));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (robert.room.roomevent) {
                                    robert.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(robert.chat.invaliduserspecified, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nolimitspecified, {
                            name: chat.un
                        }));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            robert.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(robert.chat.maximumafktimeset, {
                                name: chat.un,
                                time: robert.settings.maximumAfk
                            }));
                        } else API.sendChat(subChat(robert.chat.invalidlimitspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.afkRemoval) {
                            robert.settings.afkRemoval = !robert.settings.afkRemoval;
                            clearInterval(robert.room.afkInterval);
                            API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.afkremoval
                            }));
                        } else {
                            robert.settings.afkRemoval = !robert.settings.afkRemoval;
                            robert.room.afkInterval = setInterval(function() {
                                robert.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.afkremoval
                            }));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        robert.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(robert.chat.afkstatusreset, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var lastActive = robert.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = robert.roomUtilities.msToStr(inactivity);

                        var launchT = robert.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline) {
                            API.sendChat(subChat(robert.chat.inactivelonger, {
                                botname: robert.settings.botName,
                                name: chat.un,
                                username: name
                            }));
                        } else {
                            API.sendChat(subChat(robert.chat.inactivefor, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.autodisable) {
                            robert.settings.autodisable = !robert.settings.autodisable;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.autodisable
                            }));
                        } else {
                            robert.settings.autodisable = !robert.settings.autodisable;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.autodisable
                            }));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.autoskip) {
                            robert.settings.autoskip = !robert.settings.autoskip;
                            clearTimeout(robert.room.autoskipTimer);
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.autoskip
                            }));
                        } else {
                            robert.settings.autoskip = !robert.settings.autoskip;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.autoskip
                            }));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(robert.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(robert.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * robert.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(robert.chat.ball, {
                            name: chat.un,
                            botname: robert.settings.botName,
                            question: argument,
                            response: robert.chat.balls[randomBall]
                        }));
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = robert.userUtilities.getPermission(chat.uid);
                        var permUser = robert.userUtilities.getPermission(user.id);
                        if (permUser >= permFrom) return void(0);
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nolistspecified, {
                            name: chat.un
                        }));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof robert.room.blacklists[list] === 'undefined') return API.sendChat(subChat(robert.chat.invalidlistspecified, {
                            name: chat.un
                        }));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            robert.room.newBlacklisted.push(track);
                            robert.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(robert.chat.newblacklisted, {
                                name: chat.un,
                                blacklist: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            }));
                            if (robert.settings.smartSkip && timeLeft > timeElapsed) {
                                robert.roomUtilities.smartSkip();
                            } else {
                                API.moderateForceSkip();
                            }
                            if (typeof robert.room.newBlacklistedSongFunction === 'function') {
                                robert.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ':' + cid;

                        API.sendChat(subChat(robert.chat.blinfo, {
                            name: name,
                            author: author,
                            title: title,
                            songid: songid
                        }));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (robert.settings.bouncerPlus) {
                            robert.settings.bouncerPlus = false;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': 'Bouncer+'
                            }));
                        } else {
                            if (!robert.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = robert.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    robert.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(robert.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'Bouncer+'
                                    }));
                                }
                            } else return API.sendChat(subChat(robert.chat.bouncerplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(robert.chat.currentbotname, {
                            botname: robert.settings.botName
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            robert.settings.botName = argument;
                            API.sendChat(subChat(robert.chat.botnameset, {
                                botName: robert.settings.botName
                            }));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute('data-cid'));
                        }
                        return API.sendChat(subChat(robert.chat.chatcleared, {
                            name: chat.un
                        }));
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.cmdDeletion) {
                            robert.settings.cmdDeletion = !robert.settings.cmdDeletion;
                            API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.cmddeletion
                            }));
                        } else {
                            robert.settings.cmdDeletion = !robert.settings.cmdDeletion;
                            API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.cmddeletion
                            }));
                        }
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(robert.chat.commandslink, {
                            botname: robert.settings.botName,
                            link: robert.cmdLink
                        }));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(Math.random() * robert.chat.cookies.length);
                    return robert.chat.cookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(robert.chat.eatcookie);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = robert.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(robert.chat.nousercookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(robert.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(robert.chat.cookie, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    cookie: this.getCookie()
                                }));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        robert.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.cycleGuard) {
                            robert.settings.cycleGuard = !robert.settings.cycleGuard;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.cycleguard
                            }));
                        } else {
                            robert.settings.cycleGuard = !robert.settings.cycleGuard;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.cycleguard
                            }));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== '') {
                            robert.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(robert.chat.cycleguardtime, {
                                name: chat.un,
                                time: robert.settings.maximumCycletime
                            }));
                        } else return API.sendChat(subChat(robert.chat.invalidtime, {
                            name: chat.un
                        }));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = robert.userUtilities.getPermission(chat.uid);
                            if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(robert.chat.dclookuprank, {
                                name: chat.un
                            }));
                        }
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var toChat = robert.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*
            // This does not work anymore.
            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!robert.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == 'undefined'){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(robert.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },
            */

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        for (var i = 1; i < robert.room.chatMessages.length; i++) {
                            if (robert.room.chatMessages[i].indexOf(user.id) > -1) {
                                API.moderateDeleteChat(robert.room.chatMessages[i][0]);
                                robert.room.chatMessages[i].splice(0);
                            }
                        }
                        API.sendChat(subChat(robert.chat.deletechat, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(robert.chat.emojilist, {
                            link: link
                        }));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = robert.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch (lang) {
                            case 'en':
                                break;
                            case 'da':
                                ch += 'Vær venlig at tale engelsk.';
                                break;
                            case 'de':
                                ch += 'Bitte sprechen Sie Englisch.';
                                break;
                            case 'es':
                                ch += 'Por favor, hable Inglés.';
                                break;
                            case 'fr':
                                ch += 'Parlez anglais, s\'il vous plaît.';
                                break;
                            case 'nl':
                                ch += 'Spreek Engels, alstublieft.';
                                break;
                            case 'pl':
                                ch += 'Proszę mówić po angielsku.';
                                break;
                            case 'pt':
                                ch += 'Por favor, fale Inglês.';
                                break;
                            case 'sk':
                                ch += 'Hovorte po anglicky, prosím.';
                                break;
                            case 'cs':
                                ch += 'Mluvte prosím anglicky.';
                                break;
                            case 'sr':
                                ch += 'Молим Вас, говорите енглески.';
                                break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var perm = robert.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < API.ROLE.BOUNCER) return void(0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(robert.chat.youaredj, {
                            name: name
                        }));
                        if (pos < 0) return API.sendChat(subChat(robert.chat.notinwaitlist, {
                            name: name
                        }));
                        if (pos == 0) return API.sendChat(subChat(robert.chat.youarenext, {
                            name: name
                        }));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = robert.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(robert.chat.eta, {
                            name: name,
                            time: estimateString,
                            position: realpos
                        }));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof robert.settings.fbLink === 'string')
                            API.sendChat(subChat(robert.chat.facebook, {
                                link: robert.settings.fbLink
                            }));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.filterChat) {
                            robert.settings.filterChat = !robert.settings.filterChat;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.chatfilter
                            }));
                        } else {
                            robert.settings.filterChat = !robert.settings.filterChat;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.chatfilter
                            }));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(robert.chat.forceskip, {
                            name: chat.un
                        }));
                        API.moderateForceSkip();
                        robert.room.skippable = false;
                        setTimeout(function() {
                            robert.room.skippable = true
                        }, 5 * 1000);
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = robert.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(robert.chat.ghosting, {
                                name1: chat.un,
                                name2: name
                            }));
                        } else API.sendChat(subChat(robert.chat.notghosting, {
                            name1: chat.un,
                            name2: name
                        }));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating,
                                        'tag': fixedtag
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g, '+');
                            var commatag = tag.replace(/ /g, ', ');
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(robert.chat.validgiftags, {
                                        name: chat.un,
                                        id: id,
                                        tags: commatag
                                    }));
                                } else {
                                    API.sendChat(subChat(robert.chat.invalidgiftags, {
                                        name: chat.un,
                                        tags: commatag
                                    }));
                                }
                            });
                        } else {
                            function get_random_id(api_key, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(robert.chat.validgifrandom, {
                                        name: chat.un,
                                        id: id
                                    }));
                                } else {
                                    API.sendChat(subChat(robert.chat.invalidgifrandom, {
                                        name: chat.un
                                    }));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = '@staff, someone needs your help!';
                        API.sendChat(subChat(robert.chat.starterhelp, {
                            link: link
                        }));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.historySkip) {
                            robert.settings.historySkip = !robert.settings.historySkip;
                            API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.historyskip
                            }));
                        } else {
                            robert.settings.historySkip = !robert.settings.historySkip;
                            API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.historyskip
                            }));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.room.roulette.rouletteStatus && robert.room.roulette.participants.indexOf(chat.uid) < 0) {
                            robert.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(robert.chat.roulettejoin, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var join = robert.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = robert.roomUtilities.msToStr(time);
                        API.sendChat(subChat(robert.chat.jointime, {
                            namefrom: chat.un,
                            username: name,
                            time: timeString
                        }));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = robert.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));

                        var permFrom = robert.userUtilities.getPermission(chat.uid);
                        var permTokick = robert.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(robert.chat.kickrank, {
                                name: chat.un
                            }));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(robert.chat.kick, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function(id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        } else API.sendChat(subChat(robert.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(robert.chat.kill);
                        robert.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(robert.chat.currentlang, {
                            language: robert.settings.language
                        }));
                        var argument = msg.substring(cmd.length + 1);

                        $.get('https://rawgit.com/NotFluted/robert/master/lang/langindex.json', function(json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === 'undefined') {
                                API.sendChat(subChat(robert.chat.langerror, {
                                    link: 'https://rawgit.com/NotFluted/robert/master/lang/langindex.json'
                                }));
                            } else {
                                robert.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(robert.chat.langset, {
                                    language: robert.settings.language
                                }));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var ind = robert.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            robert.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(robert.chat.rouletteleave, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = robert.userUtilities.lookupUser(chat.uid);
                        var perm = robert.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= API.ROLE.DJ || isDj) {
                            if (media.format === 1) {
                                var linkToSong = 'https://youtu.be/' + media.cid;
                                API.sendChat(subChat(robert.chat.songlink, {
                                    name: from,
                                    link: linkToSong
                                }));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function(sound) {
                                    API.sendChat(subChat(robert.chat.songlink, {
                                        name: from,
                                        link: sound.permalink_url
                                    }));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        robert.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = robert.settings.lockdownEnabled;
                        robert.settings.lockdownEnabled = !temp;
                        if (robert.settings.lockdownEnabled) {
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.lockdown
                            }));
                        } else return API.sendChat(subChat(robert.chat.toggleoff, {
                            name: chat.un,
                            'function': robert.chat.lockdown
                        }));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.lockGuard) {
                            robert.settings.lockGuard = !robert.settings.lockGuard;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.lockguard
                            }));
                        } else {
                            robert.settings.lockGuard = !robert.settings.lockGuard;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.lockguard
                            }));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            robert.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(robert.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                robert.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    robert.room.skippable = false;
                                    setTimeout(function() {
                                        robert.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        robert.userUtilities.moveUser(id, robert.settings.lockskipPosition, false);
                                        robert.room.queueable = true;
                                        setTimeout(function() {
                                            robert.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < robert.settings.lockskipReasons.length; i++) {
                                var r = robert.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += robert.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(robert.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                robert.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    robert.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function() {
                                        robert.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        robert.userUtilities.moveUser(id, robert.settings.lockskipPosition, false);
                                        robert.room.queueable = true;
                                        setTimeout(function() {
                                            robert.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== '') {
                            robert.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(robert.chat.lockguardtime, {
                                name: chat.un,
                                time: robert.settings.maximumLocktime
                            }));
                        } else return API.sendChat(subChat(robert.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(robert.chat.logout, {
                            name: chat.un,
                            botname: robert.settings.botName
                        }));
                        setTimeout(function() {
                            $('.logout').mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            robert.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(robert.chat.maxlengthtime, {
                                name: chat.un,
                                time: robert.settings.maximumSongLength
                            }));
                        } else return API.sendChat(subChat(robert.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            mehCommand: {
                command: 'meh',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#meh').click();
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + robert.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!robert.settings.motdEnabled) robert.settings.motdEnabled = !robert.settings.motdEnabled;
                        if (isNaN(argument)) {
                            robert.settings.motd = argument;
                            API.sendChat(subChat(robert.chat.motdset, {
                                msg: robert.settings.motd
                            }));
                        } else {
                            robert.settings.motdInterval = argument;
                            API.sendChat(subChat(robert.chat.motdintervalset, {
                                interval: robert.settings.motdInterval
                            }));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        if (user.id === robert.loggedInID) return API.sendChat(subChat(robert.chat.addbotwaitlist, {
                            name: chat.un
                        }));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(robert.chat.move, {
                                name: chat.un
                            }));
                            robert.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(robert.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                return API.sendChat(subChat(robert.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = robert.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permUser = robert.userUtilities.getPermission(user.id);
                        if (permUser == API.ROLE.NONE) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(robert.chat.mutedmaxtime, {
                                    name: chat.un,
                                    time: '45'
                                }));
                            } else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(robert.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(robert.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(robert.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(robert.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            }
                        } else API.sendChat(subChat(robert.chat.muterank, {
                            name: chat.un
                        }));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof robert.settings.opLink === 'string')
                            return API.sendChat(subChat(robert.chat.oplist, {
                                link: robert.settings.opLink
                            }));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(robert.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        robert.disconnectAPI();
                        setTimeout(function() {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(robert.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        robert.disconnectAPI();
                        kill();
                        setTimeout(function() {
                            $.getScript(robert.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = robert.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                } else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(robert.chat.removenotinwl, {
                                name: chat.un,
                                username: name
                            }));
                        } else API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.etaRestriction) {
                            robert.settings.etaRestriction = !robert.settings.etaRestriction;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.etarestriction
                            }));
                        } else {
                            robert.settings.etaRestriction = !robert.settings.etaRestriction;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.etarestriction
                            }));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!robert.room.roulette.rouletteStatus) {
                            robert.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof robert.settings.rulesLink === 'string')
                            return API.sendChat(subChat(robert.chat.roomrules, {
                                link: robert.settings.rulesLink
                            }));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var woots = robert.room.roomstats.totalWoots;
                        var mehs = robert.room.roomstats.totalMehs;
                        var grabs = robert.room.roomstats.totalCurates;
                        API.sendChat(subChat(robert.chat.sessionstats, {
                            name: from,
                            woots: woots,
                            mehs: mehs,
                            grabs: grabs
                        }));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(robert.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (robert.settings.smartSkip && timeLeft > timeElapsed) {
                                    robert.roomUtilities.smartSkip();
                                } else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < robert.settings.skipReasons.length; i++) {
                                var r = robert.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += robert.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(robert.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (robert.settings.smartSkip && timeLeft > timeElapsed) {
                                    robert.roomUtilities.smartSkip(msgSend);
                                } else {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            robert.settings.skipPosition = pos;
                            return API.sendChat(subChat(robert.chat.skippos, {
                                name: chat.un,
                                position: robert.settings.skipPosition
                            }));
                        } else return API.sendChat(subChat(robert.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.songstats) {
                            robert.settings.songstats = !robert.settings.songstats;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.songstats
                            }));
                        } else {
                            robert.settings.songstats = !robert.settings.songstats;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.songstats
                            }));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('/me Robert, a custom Javascript browser bot using sources from basicBot is developed and maintained by Fluted! More information can be found here: https://goo.gl/dG7i6y');
                    }
                }
            },
		
	    discordCommand: {
                command: 'discord',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("/me Coming soon!");
                    }
                }
            },
			
	    stayCommand: {
                command: 'stay',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("Enjoy your stay!");
                    }
                }
            },
			
	    eventCommand: {
                command: 'event',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat(":eyes:");
                    }
                }
            },
		
	    plugdjCommand: {
                command: 'plugdiscord',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("Did you hear that? plug.dj has an offical Discord! Join here: https://discord.gg/RE8fkzE");
                    }
                }
            },	
		
	    plugitCommand: {
                command: 'plugit',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("Get the Plug-it extension here: https://github.com/plug-it/pi/blob/pre-release/readme.md ");
                    }
                }
            },
			
            plug3Command: {
                command: 'plug3',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("Get the Plug3 (PlugCubed) extension here: https://goo.gl/UB67zH");
                    }
                }
            },
         
            rcsCommand: {
                command: 'rcs',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("Get the Radiant Community Script (RCS) extension here: https://goo.gl/o6sD2H");
                    }
                }
            },

            guideCommand: {
                 command: 'guide',
                 rank: 'user',
                 type: 'exact',
                 functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!robert.commands.executable(this.rank, chat)) return void (0);
                    else {
                            API.sendChat("How to use plug.dj: http://i.imgur.com/ZeRR07N.png");
                    }
                 }
            },	

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += robert.chat.afkremoval + ': ';
                        if (robert.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += robert.chat.afksremoved + ': ' + robert.room.afkList.length + '. ';
                        msg += robert.chat.afklimit + ': ' + robert.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (robert.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.blacklist + ': ';
                        if (robert.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.lockguard + ': ';
                        if (robert.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.cycleguard + ': ';
                        if (robert.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.timeguard + ': ';
                        if (robert.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.chatfilter + ': ';
                        if (robert.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.historyskip + ': ';
                        if (robert.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.voteskip + ': ';
                        if (robert.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.cmddeletion + ': ';
                        if (robert.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += robert.chat.autoskip + ': ';
                        if (robert.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = robert.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = robert.roomUtilities.msToStr(durationOnline);
                        msg += subChat(robert.chat.activefor, {
                            time: since
                        });

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250) {
                            var split = msg.match(/.{1,250}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat('/me ' + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        } else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = robert.userUtilities.lookupUserName(name1);
                        var user2 = robert.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(robert.chat.swapinvalid, {
                            name: chat.un
                        }));
                        if (user1.id === robert.loggedInID || user2.id === robert.loggedInID) return API.sendChat(subChat(robert.chat.addbottowaitlist, {
                            name: chat.un
                        }));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(robert.chat.swapwlonly, {
                            name: chat.un
                        }));
                        API.sendChat(subChat(robert.chat.swapping, {
                            'name1': name1,
                            'name2': name2
                        }));
                        if (p1 === -1) {
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function(user1, p2) {
                                robert.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        } else if (p2 === -1) {
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function(user2, p1) {
                                robert.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        } else if (p1 < p2) {
                            robert.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function(user1, p2) {
                                robert.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        } else {
                            robert.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function(user2, p1) {
                                robert.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof robert.settings.themeLink === 'string')
                            API.sendChat(subChat(robert.chat.genres, {
                                link: robert.settings.themeLink
                            }));
                    }
                }
            },

            thorCommand: {
                command: 'thor',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.thorCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedThor = false,
                                indexArrUsedThor,
                                thorCd = false,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(Math.random() * 10) + 1,
                                worthy = worthyAlg == 10 ? true : false;

                            // sly benzi 👀
                            if (botCreatorIDs.indexOf(id) > -1) {
                                worthy = true;
                            }


                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < robert.room.usersUsedThor.length; i++) {
                                    if (robert.room.usersUsedThor[i].id == id) {
                                        oldTime = robert.room.usersUsedThor[i].time;
                                        usedThor = true;
                                        indexArrUsedThor = i;
                                    }
                                }

                                if (usedThor) {
                                    timeInMinutes = (robert.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    thorCd = timeInMinutes > 0 ? true : false;
                                    if (thorCd == false)
                                        robert.room.usersUsedThor.splice(indexArrUsedThor, 1);
                                }

                                if (thorCd == false || usedThor == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    robert.room.usersUsedThor.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(robert.chat.thorNotClose, {
                                    name: from
                                }));
                            } else if (thorCd) {
                                return API.sendChat(subChat(robert.chat.thorcd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    robert.userUtilities.moveUser(id, 1, false);
                                API.sendChat(subChat(robert.chat.thorWorthy, {
                                    name: from
                                }));
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    robert.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(robert.chat.thorNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.timeGuard) {
                            robert.settings.timeGuard = !robert.settings.timeGuard;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.timeguard
                            }));
                        } else {
                            robert.settings.timeGuard = !robert.settings.timeGuard;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.timeguard
                            }));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = robert.settings.blacklistEnabled;
                        robert.settings.blacklistEnabled = !temp;
                        if (robert.settings.blacklistEnabled) {
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.blacklist
                            }));
                        } else return API.sendChat(subChat(robert.chat.toggleoff, {
                            name: chat.un,
                            'function': robert.chat.blacklist
                        }));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.motdEnabled) {
                            robert.settings.motdEnabled = !robert.settings.motdEnabled;
                            API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.motd
                            }));
                        } else {
                            robert.settings.motdEnabled = !robert.settings.motdEnabled;
                            API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.motd
                            }));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.voteSkip) {
                            robert.settings.voteSkip = !robert.settings.voteSkip;
                            API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.voteskip
                            }));
                        } else {
                            robert.settings.voteSkip = !robert.settings.voteSkip;
                            API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.voteskip
                            }));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/bans', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(robert.chat.notbanned, {
                                name: chat.un
                            }));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        robert.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/mutes', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var arg = msg.substring(cmd.length + 1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = robert.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all') {
                                if (permFrom > API.ROLE.BOUNCER) {
                                    for (var i = 0; i < mutedUsers.length; i++) {
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(robert.chat.unmutedeveryone, {
                                        name: chat.un
                                    }));
                                } else API.sendChat(subChat(robert.chat.unmuteeveryonerank, {
                                    name: chat.un
                                }));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++) {
                                    var user = mutedUsers[i];
                                    if (user.username === name) {
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(robert.chat.notbanned, {
                                    name: chat.un
                                }));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            uptimeCommand: {
                command: 'uptime',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var launchT = robert.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = robert.roomUtilities.msToStr(durationOnline);
                        API.sendChat(subChat(robert.chat.activefor, {
                            time: since
                        }));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            robert.settings.commandCooldown = cd;
                            return API.sendChat(subChat(robert.chat.commandscd, {
                                name: chat.un,
                                time: robert.settings.commandCooldown
                            }));
                        } else return API.sendChat(subChat(robert.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.usercommandsEnabled) {
                            API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.usercommands
                            }));
                            robert.settings.usercommandsEnabled = !robert.settings.usercommandsEnabled;
                        } else {
                            API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.usercommands
                            }));
                            robert.settings.usercommandsEnabled = !robert.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(robert.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = robert.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(robert.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(robert.chat.voteratio, {
                            name: chat.un,
                            username: name,
                            woot: vratio.woot,
                            mehs: vratio.meh,
                            ratio: ratio.toFixed(2)
                        }));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(robert.chat.voteskiplimit, {
                            name: chat.un,
                            limit: robert.settings.voteSkipLimit
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (!robert.settings.voteSkip) robert.settings.voteSkip = !robert.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(robert.chat.voteskipinvalidlimit, {
                                name: chat.un
                            }));
                        } else {
                            robert.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(robert.chat.voteskipsetlimit, {
                                name: chat.un,
                                limit: robert.settings.voteSkipLimit
                            }));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof robert.settings.website === 'string')
                            API.sendChat(subChat(robert.chat.website, {
                                link: robert.settings.website
                            }));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (robert.settings.welcome) {
                            robert.settings.welcome = !robert.settings.welcome;
                            return API.sendChat(subChat(robert.chat.toggleoff, {
                                name: chat.un,
                                'function': robert.chat.welcomemsg
                            }));
                        } else {
                            robert.settings.welcome = !robert.settings.welcome;
                            return API.sendChat(subChat(robert.chat.toggleon, {
                                name: chat.un,
                                'function': robert.chat.welcomemsg
                            }));
                        }
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {

                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;

                                if (rawlang == 'en') {
                                    var language = 'English';
                                } else if (rawlang == 'bg') {
                                    var language = 'Bulgarian';
                                } else if (rawlang == 'cs') {
                                    var language = 'Czech';
                                } else if (rawlang == 'fi') {
                                    var language = 'Finnish';
                                } else if (rawlang == 'fr') {
                                    var language = 'French';
                                } else if (rawlang == 'pt') {
                                    var language = 'Portuguese';
                                } else if (rawlang == 'zh') {
                                    var language = 'Chinese';
                                } else if (rawlang == 'sk') {
                                    var language = 'Slovak';
                                } else if (rawlang == 'nl') {
                                    var language = 'Dutch';
                                } else if (rawlang == 'ms') {
                                    var language = 'Malay';
                                }

                                var rawrank = API.getUser(id);

                                if (rawrank.role == API.ROLE.NONE) {
                                    var rank = 'User';
                                } else if (rawrank.role == API.ROLE.DJ) {
                                    var rank = 'Resident DJ';
                                } else if (rawrank.role == API.ROLE.BOUNCER) {
                                    var rank = 'Bouncer';
                                } else if (rawrank.role == API.ROLE.MANAGER) {
                                    var rank = 'Manager';
                                } else if (rawrank.role == API.ROLE.COHOST) {
                                    var rank = 'Co-Host';
                                } else if (rawrank.role == API.ROLE.HOST) {
                                    var rank = 'Host';
                                }

                                if (rawrank.gRole == 3000) {
                                    var rank = 'Brand Ambassador';
                                } else if (rawrank.gRole == 5000) {
                                    var rank = 'Admin';
                                }

                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = 'https://plug.dj/@/' + slug;
                                } else {
                                    var profile = '~';
                                }

                                API.sendChat(subChat(robert.chat.whois, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id,
                                    avatar: avatar,
                                    profile: profile,
                                    language: language,
                                    level: level,
                                    joined: joined,
                                    rank: rank
                                }));
                            }
                        }
                    }
                }
            },

            wootCommand: {
                command: 'woot',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#woot').click();
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!robert.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof robert.settings.youtubeLink === 'string')
                            API.sendChat(subChat(robert.chat.youtube, {
                                name: chat.un,
                                link: robert.settings.youtubeLink
                            }));
                    }
                }
            }
        }
    };

    loadChat(robert.startup);
}).call(this);
