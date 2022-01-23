const localVideo = document.getElementById("local-video");
const remotesDiv = document.getElementById("remotes");

const params = new URLSearchParams(window.location.search)

const serverUrl = "wss://" + window.location.host + "/ws";

/* eslint-env browser */
const joinBtns = document.getElementById("start-btns");

const config = {
  iceServers: [
    // {
    //   urls: "turn:ion-sfu-turn.cctv.svc.cluster.local:3478",
    //   username:   "pion",
    //   credential: "ion",      
    // },
  ],
};

const signalLocal = new Signal.IonSFUJSONRPCSignal(serverUrl);

const clientLocal = new IonSDK.Client(signalLocal, config);
// signalLocal.onopen = () => clientLocal.join(params.has("session") ? params.get("session") : "test session");
signalLocal.onopen = () => clientLocal.join(params.has("session") ? params.get("session") : "cctv");

/**
 * For every remote stream this object will hold the follwing information:
 * {
 *  "id-of-the-remote-stream": {
 *     stream: [Object], // Reference to the stream object
 *     videoElement: [Object] // Reference to the video element that's rendering the stream.
 *   }
 * }
 */
const streams = {};

/**
 * When we click the Enable Audio button this function gets called, and
 * unmutes all the remote videos that might be there and also any future ones.
 * This little party trick is according to
 * https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide.
 */
let remoteVideoIsMuted = true;

function createVideo(stream) {
    // Create a video element for rendering the stream
    const remoteVideo = document.createElement("video");
    remoteVideo.dataset.streamid = stream.id;
    remoteVideo.srcObject = stream;
    remoteVideo.autoplay = true;
    remoteVideo.controls = true;
    remoteVideo.muted = remoteVideoIsMuted;
    remotesDiv.appendChild(remoteVideo);

    // Save the stream and video element in the map.
    streams[stream.id] = { stream, videoElement: remoteVideo };

    // When this stream removes a track, assume
    // that its going away and remove it.
    stream.onremovetrack = () => {
      try {
        if (streams[stream.id]) {
          const { videoElement } = streams[stream.id];
          remotesDiv.removeChild(videoElement);
          delete streams[stream.id];
        }
      } catch (err) {}
    };
}

function createAudio(stream) {
    // Create a video element for rendering the stream
    const remoteAudio = document.createElement("audio");
    remoteAudio.dataset.streamid = stream.id;
    remoteAudio.srcObject = stream;
    remoteAudio.autoplay = true;
    remoteAudio.controls = true;
    remoteAudio.muted = remoteVideoIsMuted;
    remotesDiv.appendChild(remoteAudio);

    // Save the stream and video element in the map.
    streams[stream.id] = { stream, videoElement: remoteAudio };

    // When this stream removes a track, assume
    // that its going away and remove it.
    stream.onremovetrack = () => {
      console.log("streams", streams)
      try {
        if (streams[stream.id]) {
          const { videoElement } = streams[stream.id];
          remotesDiv.removeChild(videoElement);
          delete streams[stream.id];
        }
      } catch (err) {}
      console.log("removed stream: ", streams[stream.id])
    };
}

clientLocal.ontrack = (track, stream) => {
  //console.log("got track", track.id, "for stream", stream.id);
  switch (track.id) {
    case "video":
      console.log("got track", track.id, "for stream", stream.id);
      createVideo(stream);
      break;
    case "audio":
      console.log("got track", track.id, "for stream", stream.id);
      createAudio(stream);
      break;
    default:
      console.log(`Track ID ${track.id} from ${stream.id} not recognised, not adding to remotes`);
  };
};


