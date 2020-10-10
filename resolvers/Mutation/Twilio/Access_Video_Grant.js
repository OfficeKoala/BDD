const twilioaccountSid = 'ACc82a5cdbca317629643f953e64d5d0cc';
const apiKeySid = "SK573538b2a5cb11b33356ed4468b69d94"; //I created it 
const apiKeySecret = "JuBPtF6MavPqpLA6tf17L7TNOcZhpXsg";
const AccessToken = require('twilio').jwt.AccessToken;
// Create an access token which we will sign and return to the client,
// containing the grant we just created
const token = new AccessToken(twilioaccountSid, apiKeySid, apiKeySecret);
const Access_Grant_Api = async (_, {
    identity,
    room_name
}, ctx) => {
    try {

        // Create a Video grant which enables a client to use Video 
        const videoGrant = new AccessToken.VideoGrant({
            // and limits access to the specified Room (room_name)
            room: `${room_name}`
        })

        // Add the grant to the token
        token.addGrant(videoGrant);
        token.identity = `${identity}` 
        return {
            token: token.toJwt()
        }
    } catch (err) {
        throw new Error(err)
    }
}


module.exports = {
    Access_Grant_Api
}
