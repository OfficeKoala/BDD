const {
    pool
} = require("../../../utils")

const sql = require("mssql")
const accountSid = 'AC83af5dfa34b1e45bbdca511cd34ce666';
const authToken = 'b967f3a88bc985c7e2cd930881ebb75a';
const client = require('twilio')(accountSid, authToken)
const {
    connect,
    LocalVideoTrack
} = require('twilio-video');
// console.log("&&&&&&&&&&&&&&&&&&")
const ScreenSharing = async (_, {
    room_name
}, ctx) => {
    option1();
}

async function option1() {
    // const stream = await navigator.mediaDevices.getDisplayMedia();
    try {
        const stream = await getUserScreen(['window', 'screen', 'tab', 'audio'], 'aohghmighlieiainnegkcijnfilokake');
        const screenLocalTrack = new LocalVideoTrack(stream.getVideoTracks()[0]);

        const room = await connect('my-token', {
            name: `${room_name}`,
            tracks: [screenLocalTrack]
        });

        screenLocalTrack.once('stopped', () => {
            room.localParticipant.removeTrack(screenLocalTrack);
        });

        return room;
    } catch (err) {
        throw new Error(err)
    }
}

function getUserScreen(sources, extensionId) {
    try { 
        const request = {
            type: 'getUserScreen',
            sources: sources
        };
        return new Promise((resolve, reject) => {
            chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
                const sources = message.sources;
                const tab = sender.tab;
                chrome.desktopCapture.chooseDesktopMedia(sources, tab, (streamId) => {

                });
                return true;
            });

            chrome.runtime.sendMessage(extensionId, request, response => {
                switch (response && response.type) {
                    case 'success':
                        resolve(response.streamId);
                        break;

                    case 'error':
                        reject(new Error(error.message));
                        break;

                    default:
                        reject(new Error('Unknown response'));
                        break;
                }
            });
        }).then(streamId => {
            return navigator.mediaDevices.getUserMedia({
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: streamId,
                        // You can provide additional constraints. For example,
                        // maxWidth: 1920,
                        // maxHeight: 1080,
                        // maxFrameRate: 10,
                        // minAspectRatio: 1.77
                    }
                }
            });
        });
    } catch (err) {
        throw new Error(err)
    }
}




module.exports = {
    ScreenSharing
}