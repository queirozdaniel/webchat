<template>
    <div class="flex flex-col mx-10 items-center mt-12">
        <NuxtLink to="/" class="underline">Back to Home</NuxtLink>
        <video autoPlay ref="userVideo"></video>
        <video autoPlay ref="partnerVideo"></video>
    </div>
</template>

<script setup lang="ts">

const router = useRouter()

const userVideo = ref('');
const userStream = ref();
const partnerVideo = ref('');
const peerRef = ref();
const webSocketRef = ref();

const openCamera = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    console.log(allDevices)
    const cameras = allDevices.filter(
        (device) => device.kind == "videoinput"
    );
    console.log(cameras);

    const constraints = {
        audio: true,
        video: {
            deviceId: cameras[0].deviceId,
        },
    };

    try {
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
        console.log(err);
    }
};

const handleOffer = async (offer: any) => {
    console.log("Received Offer, Creating Answer");
    peerRef.value = createPeer();

    await peerRef.value.setRemoteDescription(
        new RTCSessionDescription(offer)
    );

    userStream.value.getTracks().forEach((track: any) => {
        peerRef.value.addTrack(track, userStream.value);
    });

    const answer = await peerRef.value.createAnswer();
    await peerRef.value.setLocalDescription(answer);

    webSocketRef.value.send(
        JSON.stringify({ answer: peerRef.value.localDescription })
    );
};

const callUser = () => {
    console.log("Calling Other User");
    peerRef.value = createPeer();

    userStream.value.getTracks().forEach((track: any) => {
        peerRef.value.addTrack(track, userStream.value);
    });
};

const createPeer = () => {
    console.log("Creating Peer Connection");
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleIceCandidateEvent;
    peer.ontrack = handleTrackEvent;

    return peer;
};

const handleNegotiationNeeded = async () => {
    console.log("Creating Offer");

    try {
        const myOffer = await peerRef.value.createOffer();
        await peerRef.value.setLocalDescription(myOffer);

        webSocketRef.value.send(
            JSON.stringify({ offer: peerRef.value.localDescription })
        );
    } catch (err) {}
};

const handleIceCandidateEvent = (e: any) => {
    console.log("Found Ice Candidate");
    if (e.candidate) {
        console.log(e.candidate);
        webSocketRef.value.send(
            JSON.stringify({ iceCandidate: e.candidate })
        );
    }
};

const handleTrackEvent = (e: any) => {
    console.log("Received Tracks");
    partnerVideo.value.srcObject = e.streams[0];
};

onMounted(() => {
    openCamera().then((stream) => {
        userVideo.value.srcObject = stream;
        userStream.value = stream;

        webSocketRef.value = new WebSocket(
            `ws://localhost:8000/join?roomID=${router.params.id}`
        );

        webSocketRef.value.addEventListener("open", () => {
            webSocketRef.value.send(JSON.stringify({ join: true }));
        });

        webSocketRef.value.addEventListener("message", async (e) => {
            const message = JSON.parse(e.data);

            if (message.join) {
                callUser();
            }

            if (message.offer) {
                handleOffer(message.offer);
            }

            if (message.answer) {
                console.log("Receiving Answer");
                peerRef.value.setRemoteDescription(
                    new RTCSessionDescription(message.answer)
                );
            }

            if (message.iceCandidate) {
                console.log("Receiving and Adding ICE Candidate");
                try {
                    await peerRef.value.addIceCandidate(
                        message.iceCandidate
                    );
                } catch (err) {
                    console.log("Error Receiving ICE Candidate", err);
                }
            }
        });
    });
})
</script>
