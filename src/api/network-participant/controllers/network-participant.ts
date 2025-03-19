import { JSDOM } from "jsdom";
import _sodium from "libsodium-wrappers";
import { SubscribeRequest } from "../../../types/requests/SubscribeRequest";

const NAMESPACE = process.env.DEDI_NAMESPACE || "fide.org.temp";
const registryName = "network-subscribers-temp"

export default {
    async subscribe(ctx) {
        try {
            const body: SubscribeRequest = ctx.request.body;
            const signingPublicKey = body.signing_public_key;

            const subscriberUrl = body.url;
            const subscriberId = body.subscriber_id
            const metaContent = await getSiteVerificationContent(`${subscriberUrl}/public/verification.html`);

            const decryptedContent = await decryptMessage(metaContent, signingPublicKey);
            const payload = JSON.parse(decryptedContent);

            if (payload.subscriber_id != subscriberId) {
                throw new Error("Site verification failed: Subscriber id missmatched");
            }

            const challenge = Math.random().toString(36).substring(2, 2 + 6);
            console.log({ "generated challenge": challenge })
            const subscriberResponse = await onSubscribe(subscriberId, subscriberUrl, challenge);
            if (!subscriberResponse.answer)
                throw new Error("Subscriber answer is not received");

            console.log({ "onSubscribe response": subscriberResponse })

            const decryptedChallenge = await decryptMessage(subscriberResponse.answer, signingPublicKey);
            console.log({ decryptedChallenge })

            if (challenge !== decryptedChallenge) {
                throw new Error("Challenge verification failed");
            }


            const data = {
                record_name: body.subscriber_id,
                description: body.subscriber_id,
                details: {
                    key_id: body.key_id,
                    domain: body.domain,
                    type: body.type,
                    nonce: body.nonce,
                    url: body.url,
                    city_code: body.location.city.code,
                    country_code: body.location.country.code,
                    signing_public_key: body.signing_public_key,
                    subscriber_id: body.subscriber_id,
                    encr_public_key: body.encr_public_key,
                    valid_from: body.valid_from,
                    valid_until: body.valid_until,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    status: "SUBSCRIBED"
                }
            };

            await strapi
                .api("dedi")
                .service("dedi")
                .addRecord(NAMESPACE, registryName, data);

            ctx.send({ message: "Record verified and created" }, 200);
        }
        catch (error) {
            console.log(error);
            ctx.throw(400, error.message);
        }
    }
}

async function getSiteVerificationContent(siteUrl: string) {

    const response = await fetch(siteUrl);
    if (!response.ok) throw new Error(`Failed to read the ${siteUrl}`);

    const html = await response.text();
    const dom = new JSDOM(html);
    const metaTag = dom.window.document.querySelector('meta[name="site-verification"]');
    const content = metaTag ? metaTag.getAttribute("content") : null

    return content;
}

const decryptMessage = async (signedMessageBase64: string, publicKeyBase64: string) => {
    try {
        await _sodium.ready;
        const sodium = _sodium;

        // Convert values from Base64 to Uint8Array
        const signedMessage = sodium.from_base64(signedMessageBase64, sodium.base64_variants.ORIGINAL);
        const publicKey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);

        // Verify and extract the original message
        const originalMessage = sodium.crypto_sign_open(signedMessage, publicKey);

        // Convert Uint8Array back to a string
        return new TextDecoder().decode(originalMessage);
    } catch (error) {
        throw new Error(
            "Signature verification failed. The message is either tampered with or the public key is incorrect."
        );
    }
};

const onSubscribe = async (subscriberId: string, subscriberUrl: string, challenge: string) => {
    console.log("Preparing request to subscriber:", subscriberUrl);

    const url = `${subscriberUrl}/on_subscribe`;
    const payload = {
        subscriber_id: subscriberId, // Assign the actual subscriber ID dynamically
        challenge: challenge, // Generate a random challenge string
    };

    console.log("Request URL:", url);
    console.log("Request Payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.json();
            console.error("Error Response:", errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${JSON.stringify(errorText)}`);
        }

        const responseData = await response.json();
        console.log("Response Data:", JSON.stringify(responseData, null, 2));

        return responseData;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}
