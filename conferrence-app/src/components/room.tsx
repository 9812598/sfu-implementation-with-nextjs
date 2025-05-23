"use client";
import React from "react";
import { Device } from "mediasoup-client";
import { io as socketIOClient } from "socket.io-client";
import { config } from "../lib/app.config";

const MODE_STREAM = "stream";
// const MODE_SHARE_SCREEN = "share_screen";

const CreateRemoteVideos = (props: any) => {
  const remoteVideo: any = React.useRef(null);

  React.useEffect(() => {
    if (!remoteVideo.current || !props.peer?.stream) {
      console.warn("Missing video element or stream");
      return;
    }

    const playVideoStream = async () => {
      try {
        remoteVideo.current.srcObject = props.peer.stream;
        remoteVideo.current.volume = 1;
        await remoteVideo.current.play();
      } catch (err) {
        console.error("Failed to play video:", err);
        // Retry logic for autoplay failures
        if (err.name === "NotAllowedError") {
          const playButton = document.createElement("button");
          playButton.onclick = () => {
            remoteVideo.current.play();
            playButton.remove();
          };
          playButton.textContent = "Play Video";
          remoteVideo.current.parentElement?.appendChild(playButton);
        }
      }
    };

    playVideoStream();

    return () => {
      if (remoteVideo.current?.srcObject) {
        remoteVideo.current.srcObject = null;
      }
    };
  }, [props.peer?.stream]);

  return (
    <video
      ref={remoteVideo}
      controls
      playsInline
      autoPlay
      style={{
        width: "240px",
        height: "180px",
        border: "1px solid black",
        backgroundColor: "#000",
      }}
    />
  );
};
export const MemoizedCreateRemoteVideos = React.memo(CreateRemoteVideos);

function MeetRoom(props: any) {
  // const localScreen: any = React.useRef(null);
  // const localStreamScreen: any = React.useRef(null);

  const localVideo: any = React.useRef(null);
  const localStream: any = React.useRef(null);
  const clientId: any = React.useRef(null);
  const device: any = React.useRef(null);
  const producerTransport: any = React.useRef(null);
  const videoProducer: any = React.useRef({});
  const audioProducer: any = React.useRef({});
  const consumerTransport: any = React.useRef(null);
  const videoConsumers: any = React.useRef({});
  const audioConsumers: any = React.useRef({});
  const consumersStream: any = React.useRef({});
  const socketRef: any = React.useRef(null);

  const [useVideo, setUseVideo] = React.useState(true);
  const [useAudio, setUseAudio] = React.useState(true);
  const [isStartMedia, setIsStartMedia] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [remoteVideos, setRemoteVideos]: any = React.useState({});
  // const [isShareScreen, setIsShareScreen] = React.useState(false);

  // ============ UI button ==========

  // const handleStartScreenShare = () => {
  //   if (localStreamScreen.current) {
  //     console.warn("WARN: local media ALREADY started");
  //     return;
  //   }
  //   if (!localScreen.current) {
  //     console.warn("Screen element reference not found");
  //     return;
  //   }

  //   const mediaDevices: any = navigator.mediaDevices;
  //   mediaDevices
  //     .getDisplayMedia({ audio: useAudio, video: useVideo })
  //     .then((stream: any) => {
  //       localStreamScreen.current = stream;

  //       playVideo(localScreen.current, localStreamScreen.current);
  //       handleConnectScreenShare();
  //       setIsShareScreen(true);
  //       const screenTrack = stream.getTracks()[0];
  //       screenTrack.onended = function () {
  //         handleDisconnectScreenShare();
  //       };
  //     })
  //     .catch((err: any) => {
  //       console.error("media ERROR:", err);
  //     });
  // };

  // async function handleConnectScreenShare() {
  //   if (!localStreamScreen.current) {
  //     console.warn("WARN: local media NOT READY");
  //     return;
  //   }

  //   // // --- connect socket.io ---
  //   // await connectSocket().catch((err: any) => {
  //   //     console.error(err);
  //   //     return;
  //   // });

  //   // console.log('connected');

  //   // --- get capabilities --
  //   const data = await sendRequest("getRouterRtpCapabilities", {});
  //   console.log("getRouterRtpCapabilities:", data);
  //   await loadDevice(data);

  //   // --- get transport info ---
  //   console.log("--- createProducerTransport --");
  //   const params = await sendRequest("createProducerTransport", {
  //     mode: MODE_SHARE_SCREEN,
  //   });
  //   console.log("transport params:", params);
  //   producerTransport.current = device.current.createSendTransport(params);
  //   console.log("createSendTransport:", producerTransport.current);

  //   // --- join & start publish --
  //   producerTransport.current.on(
  //     "connect",
  //     async ({ dtlsParameters }: any, callback: any, errback: any) => {
  //       console.log("--trasnport connect");
  //       sendRequest("connectProducerTransport", {
  //         dtlsParameters: dtlsParameters,
  //       })
  //         .then(callback)
  //         .catch(errback);
  //     }
  //   );

  //   producerTransport.current.on(
  //     "produce",
  //     async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
  //       console.log("--trasnport produce");
  //       try {
  //         const { id }: any = await sendRequest("produce", {
  //           transportId: producerTransport.current.id,
  //           kind,
  //           rtpParameters,
  //           mode: MODE_SHARE_SCREEN,
  //         });
  //         callback({ id });
  //         console.log("--produce requested, then subscribe ---");
  //         subscribe();
  //       } catch (err) {
  //         errback(err);
  //       }
  //     }
  //   );

  //   producerTransport.current.on("connectionstatechange", (state: any) => {
  //     switch (state) {
  //       case "connecting":
  //         console.log("publishing...");
  //         break;

  //       case "connected":
  //         console.log("published");
  //         //  setIsConnected(true);
  //         break;

  //       case "failed":
  //         console.log("failed");
  //         producerTransport.current.close();
  //         break;

  //       default:
  //         break;
  //     }
  //   });

  //   if (useVideo) {
  //     const videoTrack = localStreamScreen.current.getVideoTracks()[0];
  //     if (videoTrack) {
  //       const trackParams = { track: videoTrack };
  //       videoProducer.current[MODE_SHARE_SCREEN] =
  //         await producerTransport.current.produce(trackParams);
  //     }
  //   }
  //   if (useAudio) {
  //     const audioTrack = localStreamScreen.current.getAudioTracks()[0];
  //     if (audioTrack) {
  //       const trackParams = { track: audioTrack };
  //       audioProducer.current[MODE_SHARE_SCREEN] =
  //         await producerTransport.current.produce(trackParams);
  //     }
  //   }
  // }

  // function handleStopScreenShare() {
  //   if (localStreamScreen.current) {
  //     pauseVideo(localScreen.current);
  //     stopLocalStream(localStreamScreen.current);
  //     localStreamScreen.current = null;
  //     setIsShareScreen(false);
  //   }
  // }
  // async function handleDisconnectScreenShare() {
  //   handleStopScreenShare();
  //   {
  //     const producer = videoProducer.current[MODE_SHARE_SCREEN];
  //     producer?.close();
  //     delete videoProducer.current[MODE_SHARE_SCREEN];
  //   }
  //   {
  //     const producer = audioProducer.current[MODE_SHARE_SCREEN];
  //     producer?.close();
  //     delete audioProducer.current[MODE_SHARE_SCREEN];
  //   }

  //   await sendRequest("producerStopShareScreen", {});
  // }

  const handleUseVideo = (e: any) => {
    setUseVideo(!useVideo);
  };
  const handleUseAudio = (e: any) => {
    setUseAudio(!useAudio);
  };

  const handleStartMedia = () => {
    if (localStream.current) {
      console.warn("WARN: local media ALREADY started");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: useAudio, video: useVideo })
      .then((stream: any) => {
        localStream.current = stream;
        playVideo(localVideo.current, localStream.current);
        setIsStartMedia(true);
      })
      .catch((err: any) => {
        console.error("media ERROR:", err);
      });
  };

  function handleStopMedia() {
    if (localStream.current) {
      pauseVideo(localVideo.current);
      stopLocalStream(localStream.current);
      localStream.current = null;
      setIsStartMedia(false);
    }
  }

  function handleDisconnect() {
    try {
      handleStopMedia();

      // Clean up producers
      Object.values(videoProducer.current).forEach((producer) => {
        if (producer) {
          producer.close();
        }
      });
      videoProducer.current = {};

      Object.values(audioProducer.current).forEach((producer) => {
        if (producer) {
          producer.close();
        }
      });
      audioProducer.current = {};

      // Clean up transport
      if (producerTransport.current) {
        producerTransport.current.close();
        producerTransport.current = null;
      }

      // Clean up consumers
      Object.keys(videoConsumers.current).forEach((key) => {
        const consumers = videoConsumers.current[key];
        Object.values(consumers).forEach((consumer) => {
          if (consumer) {
            consumer.close();
          }
        });
      });
      videoConsumers.current = {};

      Object.keys(audioConsumers.current).forEach((key) => {
        const consumers = audioConsumers.current[key];
        Object.values(consumers).forEach((consumer) => {
          if (consumer) {
            consumer.close();
          }
        });
      });
      audioConsumers.current = {};

      // Clean up streams
      consumersStream.current = {};

      if (consumerTransport.current) {
        consumerTransport.current.close();
        consumerTransport.current = null;
      }

      removeAllRemoteVideo();
      disconnectSocket();
      setIsConnected(false);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }

  function playVideo(element: any, stream: any) {
    if (!element) {
      console.warn("Element is null, cannot play video");
      return;
    }
    if (element.srcObject) {
      console.warn("element ALREADY playing, so ignore");
      return;
    }
    element.srcObject = stream;
    element.volume = 0;
    return element.play().catch((err: any) => {
      console.warn("Auto-play failed:", err);
      // Add a play button or other fallback here if needed
    });
  }

  function pauseVideo(element: any) {
    element.pause();
    element.srcObject = null;
  }

  function stopLocalStream(stream: any) {
    let tracks = stream.getTracks();
    if (!tracks) {
      console.warn("NO tracks");
      return;
    }

    tracks.forEach((track: any) => track.stop());
  }

  function addRemoteTrack(id: any, track: any, mode: string) {
    // let video: any = findRemoteVideo(id);
    // if (!video) {
    //     video = addRemoteVideo(id);
    //     video.controls = '1';
    // }

    // if (video.srcObject) {
    //     video.srcObject.addTrack(track);
    //     return;
    // }

    if (id === clientId.current) {
      return false;
    }

    console.log("addremotetrack");
    console.log(track);

    if (consumersStream.current[id] == undefined) {
      consumersStream.current[id] = {};
    }

    if (consumersStream.current[id][mode] == undefined) {
      const newStream = new MediaStream();
      newStream.addTrack(track);
      consumersStream.current[id][mode] = {
        stream: newStream,
        socket_id: id,
      };
    } else {
      //add audiotrack
      consumersStream.current[id][mode].stream.addTrack(track);
    }

    setRemoteVideos((peers: any) => {
      const newPeers: any = peers;

      return { ...consumersStream.current };
    });

    // setRemoteVideos((peers: any) => {
    //     const newPeers: any = peers;
    //     if (newPeers[id] == undefined) {
    //         newPeers[id] = {};
    //     }
    //     newPeers[id][mode] = {
    //         stream: newStream,
    //         socket_id: id,
    //     };
    //     return { ...peers, ...newPeers };
    // });
    // setShouldLoadConsumerShareScreen

    // playVideo(video, newStream)
    //     .then(() => {
    //         video.volume = 1.0;
    //     })
    //     .catch((err: any) => {
    //         console.error('media ERROR:', err);
    //     });
  }

  function addRemoteVideo(id: any) {
    let existElement = findRemoteVideo(id);
    if (existElement) {
      console.warn("remoteVideo element ALREADY exist for id=" + id);
      return existElement;
    }

    let element = document.createElement("video");
    return element;
  }

  function findRemoteVideo(id: any) {
    let element = remoteVideos.current[id];
    return element;
  }

  // function removeRemoteVideoByMode(id: any, mode: string) {
  //     console.log(' ---- removeRemoteVideo() id=' + id);
  //     delete consumersStream.current[id][mode];
  //     setRemoteVideos((peers: any) => {
  //         const newPeers: any = peers;
  //         delete newPeers[id][mode];

  //         return { ...peers, ...newPeers };
  //     });
  // }

  function removeRemoteVideo(id: any, mode: string) {
    console.log(" ---- removeRemoteVideo() id=" + id);
    if (mode == MODE_STREAM) {
      delete consumersStream.current[id];
    } else {
      delete consumersStream.current[id][mode];
    }

    setRemoteVideos((peers: any) => {
      const newPeers: any = peers;
      delete newPeers[id];

      return { ...consumersStream.current };
    });
    // if (element) {
    //     element.pause();
    //     element.srcObject = null;
    //     remoteContainer.removeChild(element);
    // } else {
    //     console.log('child element NOT FOUND');
    // }
  }

  function removeAllRemoteVideo() {
    console.log(" ---- removeAllRemoteVideo() id");
    consumersStream.current = {};
    setRemoteVideos((peers: any) => {
      const newPeers = {};

      return { ...newPeers };
    });
    // while (remoteContainer.firstChild) {
    //     remoteContainer.firstChild.pause();
    //     remoteContainer.firstChild.srcObject = null;
    //     remoteContainer.removeChild(remoteContainer.firstChild);
    // }
  }

  async function consumeAdd(
    transport: any,
    remoteSocketId: any,
    prdId: any,
    trackKind: any,
    mode: any = MODE_STREAM
  ) {
    console.log("--start of consumeAdd -- kind=%s", trackKind);

    if (!transport) {
      console.error("Transport not available, attempting to recreate");
      await subscribe(); // Recreate transport if missing
      return;
    }

    try {
      const { rtpCapabilities } = device.current;
      const data = await sendRequest("consumeAdd", {
        rtpCapabilities: rtpCapabilities,
        remoteId: remoteSocketId,
        kind: trackKind,
        mode: mode,
      });

      if (!data) {
        throw new Error("Failed to get consumer data");
      }

      const { producerId, id, kind, rtpParameters }: any = data;
      if (prdId && prdId !== producerId) {
        console.warn("producerID NOT MATCH");
      }

      let consumer = await transport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
        codecOptions: {},
        paused: false,
      });

      addConsumer(remoteSocketId, consumer, kind, mode);
      consumer.remoteId = remoteSocketId;

      consumer.on("transportclose", () => {
        console.log(
          "--consumer transport closed. remoteId=" + consumer.remoteId
        );
        removeConsumer(consumer.remoteId, kind, mode);
        removeRemoteVideo(consumer.remoteId, mode);
      });

      consumer.on("producerclose", () => {
        console.log(
          "--consumer producer closed. remoteId=" + consumer.remoteId
        );
        consumer.close();
        removeConsumer(consumer.remoteId, kind, mode);
        removeRemoteVideo(consumer.remoteId, mode);
      });

      consumer.on("trackended", () => {
        console.log("--consumer trackended. remoteId=" + consumer.remoteId);
        removeConsumer(consumer.remoteId, kind, mode);
        removeRemoteVideo(consumer.remoteId, mode);
      });

      console.log("--end of consumeAdd");

      await sendRequest("resumeAdd", {
        remoteId: remoteSocketId,
        kind: kind,
        mode,
      });

      return new Promise((resolve) => {
        addRemoteTrack(remoteSocketId, consumer.track, mode);
        resolve();
      });
    } catch (err) {
      console.error("Consumer creation failed:", err);
      // Attempt to recover
      if (err.message?.includes("transport")) {
        consumerTransport.current?.close();
        consumerTransport.current = null;
        await subscribe(); // Retry subscription
      }
      throw err;
    }
  }

  async function handleConnect() {
    if (!localStream.current) {
      console.warn("WARN: local media NOT READY");
      return;
    }

    // --- connect socket.io ---
    await connectSocket().catch((err: any) => {
      console.error(err);
      return;
    });

    console.log("connected");

    // --- get capabilities --
    const data = await sendRequest("getRouterRtpCapabilities", {});
    console.log("getRouterRtpCapabilities:", data);
    await loadDevice(data);

    // --- get transport info ---
    console.log("--- createProducerTransport --");
    const params = await sendRequest("createProducerTransport", {
      mode: MODE_STREAM,
    });
    console.log("transport params:", params);
    producerTransport.current = device.current.createSendTransport(params);
    console.log("createSendTransport:", producerTransport.current);

    // --- join & start publish --
    producerTransport.current.on(
      "connect",
      async ({ dtlsParameters }: any, callback: any, errback: any) => {
        console.log("--trasnport connect");
        sendRequest("connectProducerTransport", {
          dtlsParameters: dtlsParameters,
        })
          .then(callback)
          .catch(errback);
      }
    );

    producerTransport.current.on(
      "produce",
      async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
        console.log("--trasnport produce");
        try {
          const { id }: any = await sendRequest("produce", {
            transportId: producerTransport.current.id,
            kind,
            rtpParameters,
            mode: MODE_STREAM,
          });
          callback({ id });
          console.log("--produce requested, then subscribe ---");
          subscribe();
        } catch (err) {
          errback(err);
        }
      }
    );

    producerTransport.current.on("connectionstatechange", (state: any) => {
      console.log(`Producer transport state changed to: ${state}`);
      switch (state) {
        case "connecting":
          console.log("publishing...");
          console.log(
            "Current transport parameters:",
            producerTransport.current
          );
          break;

        case "connected":
          console.log("published");
          console.log(
            "Transport connected successfully:",
            producerTransport.current
          );
          setIsConnected(true);
          break;

        case "failed":
          console.error("Transport failed");
          console.error("Last transport state:", producerTransport.current);
          console.error("Current device state:", device.current);
          producerTransport.current.close();
          break;

        default:
          console.log("Unknown transport state:", state);
          break;
      }
    });

    if (useVideo) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        const trackParams = { track: videoTrack };
        videoProducer.current[MODE_STREAM] =
          await producerTransport.current.produce(trackParams);
      }
    }
    if (useAudio) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        const trackParams = { track: audioTrack };
        audioProducer.current[MODE_STREAM] =
          await producerTransport.current.produce(trackParams);
      }
    }
  }

  async function subscribe() {
    try {
      // Ensure socket connection
      if (!socketRef.current) {
        await connectSocket().catch((err: any) => {
          console.error("Socket connection failed:", err);
          throw err;
        });
      }

      // Ensure device is loaded
      if (!device.current?.loaded) {
        const data = await sendRequest("getRouterRtpCapabilities", {});
        await loadDevice(data);
      }

      // Create consumer transport if it doesn't exist
      if (!consumerTransport.current) {
        console.log("--- createConsumerTransport --");
        const params = await sendRequest("createConsumerTransport", {});

        if (!params) {
          throw new Error("Failed to get consumer transport parameters");
        }

        consumerTransport.current = device.current.createRecvTransport(params);

        // Handle transport connection
        consumerTransport.current.on(
          "connect",
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            try {
              await sendRequest("connectConsumerTransport", {
                dtlsParameters: dtlsParameters,
              });
              callback();
            } catch (err) {
              errback(err);
              console.error("Failed to connect consumer transport:", err);
            }
          }
        );

        // Handle connection state changes
        consumerTransport.current.on(
          "connectionstatechange",
          async (state: any) => {
            console.log(`Consumer transport state changed to ${state}`);
            switch (state) {
              case "failed":
                console.error("Consumer transport failed");
                // Attempt to recreate transport
                consumerTransport.current?.close();
                consumerTransport.current = null;
                await subscribe(); // Retry subscription
                break;
              case "disconnected":
                console.log("Consumer transport disconnected");
                break;
              case "connected":
                console.log("Consumer transport connected");
                break;
              default:
                break;
            }
          }
        );
      }

      // Get remote producer info
      const remoteInfo = await sendRequest("getProducers", {});
      console.log("getProducers:", remoteInfo);

      // Consume all existing producers
      await consumeAll(remoteInfo);
    } catch (err) {
      console.error("Subscribe failed:", err);
      // Clean up on failure
      if (consumerTransport.current) {
        consumerTransport.current.close();
        consumerTransport.current = null;
      }
      throw err;
    }
  }

  async function loadDevice(routerRtpCapabilities: any) {
    try {
      if (!device.current) {
        device.current = new Device();
      }
      if (!device.current.loaded) {
        await device.current.load({ routerRtpCapabilities });
      }
    } catch (error: any) {
      if (error.name === "UnsupportedError") {
        console.error("browser not supported");
      } else {
        console.error("Failed to load device:", error);
      }
      throw error;
    }
  }

  function sendRequest(type: any, data: any) {
    return new Promise((resolve: any, reject: any) => {
      socketRef.current.emit(type, data, (err: any, response: any) => {
        if (!err) {
          // Success response, so pass the mediasoup response to the local Room.
          resolve(response);
        } else {
          reject(err);
        }
      });
    });
  }

  async function consumeCurrentProducers(clientId: any) {
    console.log("-- try consuleAll() --");
    const remoteInfo: any = await sendRequest("getCurrentProducers", {
      localId: clientId.current,
    }).catch((err) => {
      console.error("getCurrentProducers ERROR:", err);
      return;
    });
    //console.log('remoteInfo.producerIds:', remoteInfo.producerIds);
    console.log("remoteInfo.remoteVideoIds:", remoteInfo.remoteVideoIds);
    console.log("remoteInfo.remoteAudioIds:", remoteInfo.remoteAudioIds);
    consumeAll(
      consumerTransport.current,
      remoteInfo.remoteVideoIds,
      remoteInfo.remoteAudioIds
    );
  }

  function consumeAll(transport: any, remoteVideoIds: any, remotAudioIds: any) {
    console.log("----- consumeAll() -----");

    remoteVideoIds.forEach((rId: any) => {
      consumeAdd(transport, rId, null, "video", MODE_STREAM).then(
        (resp: any) => {
          consumeAdd(transport, rId, null, "video");
        }
      );
    });
    let audioIdsCount = 0;
    remotAudioIds.forEach((rId: any) => {
      consumeAdd(transport, rId, null, "audio", MODE_STREAM).then(
        (resp: any) => {
          consumeAdd(transport, rId, null, "audio");
        }
      );
    });
  }

  function disconnectSocket() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      clientId.current = null;
      console.log("socket.io closed..");
    }
  }

  function removeConsumer(id: any, kind: any, mode: string) {
    if (mode == undefined) {
      return false;
    }
    if (kind === "video") {
      if (mode == MODE_STREAM) {
        delete videoConsumers.current[id];
      } else {
        delete videoConsumers.current[id][mode];
      }

      console.log(
        "videoConsumers count=" + Object.keys(videoConsumers.current).length
      );
    } else if (kind === "audio") {
      if (mode == MODE_STREAM) {
        delete audioConsumers.current[id];
      } else {
        delete audioConsumers.current[id][mode];
      }

      console.log(
        "audioConsumers count=" + Object.keys(audioConsumers.current).length
      );
    } else {
      console.warn("UNKNOWN consumer kind=" + kind);
    }
  }

  // function getConsumer(id: any, kind: any) {
  //     if (kind === 'video') {
  //         return videoConsumers.current[id];
  //     } else if (kind === 'audio') {
  //         return audioConsumers.current[id];
  //     } else {
  //         console.warn('UNKNOWN consumer kind=' + kind);
  //     }
  // }

  function addConsumer(id: any, consumer: any, kind: any, mode: any) {
    if (id === clientId.current) {
      return false;
    }
    if (kind === "video") {
      if (videoConsumers.current[id] == undefined) {
        videoConsumers.current[id] = {};
      }
      videoConsumers.current[id][mode] = consumer;
      console.log(
        "videoConsumers count=" + Object.keys(videoConsumers.current).length
      );
    } else if (kind === "audio") {
      if (audioConsumers.current[id] == undefined) {
        audioConsumers.current[id] = {};
      }
      audioConsumers.current[id][mode] = consumer;

      console.log(
        "audioConsumers count=" + Object.keys(audioConsumers.current).length
      );
    } else {
      console.warn("UNKNOWN consumer kind=" + kind);
    }
  }

  const connectSocket: any = () => {
    if (socketRef.current == null) {
      const io: any = socketIOClient(
        config.SERVER_ENDPOINT + "/video-conference"
      );
      socketRef.current = io;
    }

    return new Promise((resolve: any, reject: any) => {
      const socket = socketRef.current;

      socket.on("connect", function (evt: any) {
        console.log("socket.io connected()");
      });
      socket.on("error", function (err: any) {
        console.error("socket.io ERROR:", err);
        reject(err);
      });
      socket.on("message", function (message: any) {
        console.log("socket.io message:", message);
        if (message.type === "welcome") {
          if (socket.id !== message.id) {
            console.warn(
              "WARN: something wrong with clientID",
              socket.io,
              message.id
            );
          }

          clientId.current = message.id;
          console.log("connected to server. clientId=" + clientId.current);
          resolve();
        } else {
          console.error("UNKNOWN message from server:", message);
        }
      });
      socket.on("newProducer", function (message: any) {
        console.log("socket.io newProducer:", message);
        const remoteId = message.socketId;
        const prdId = message.producerId;
        const kind = message.kind;
        const mode = message.mode;

        if (kind === "video") {
          console.log(
            "--try consumeAdd remoteId=" +
              remoteId +
              ", prdId=" +
              prdId +
              ", kind=" +
              kind
          );
          consumeAdd(consumerTransport.current, remoteId, prdId, kind, mode);
        } else if (kind === "audio") {
          //console.warn('-- audio NOT SUPPORTED YET. skip remoteId=' + remoteId + ', prdId=' + prdId + ', kind=' + kind);
          console.log(
            "--try consumeAdd remoteId=" +
              remoteId +
              ", prdId=" +
              prdId +
              ", kind=" +
              kind
          );
          consumeAdd(consumerTransport.current, remoteId, prdId, kind, mode);
        }
      });

      socket.on("producerClosed", function (message: any) {
        console.log("socket.io producerClosed:", message);
        const localId = message.localId;
        const remoteId = message.remoteId;
        const kind = message.kind;
        const mode = message.mode;
        console.log(
          "--try removeConsumer remoteId=%s, localId=%s, track=%s",
          remoteId,
          localId,
          kind
        );
        removeConsumer(remoteId, kind, mode);
        removeRemoteVideo(remoteId, mode);
      });
      // socket.on('shareScreenClosed', function (payload: any) {
      //     console.log('socket.io shareScreenClosed:', payload);
      //     const callerID = payload.callerID;

      //     removeConsumer(callerID, 'video', MODE_SHARE_SCREEN);
      //     removeConsumer(callerID, 'audio', MODE_SHARE_SCREEN);
      //     removeRemoteVideoByMode(callerID, MODE_SHARE_SCREEN);
      // });
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-6 mb-8">
        <div className="flex items-center gap-2">
          <input
            disabled={isStartMedia}
            onChange={handleUseVideo}
            type="checkbox"
            checked={useVideo}
            className="w-4 h-4 accent-blue-500"
          />
          <label className="text-gray-700">Video</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            disabled={isStartMedia}
            onChange={handleUseAudio}
            type="checkbox"
            checked={useAudio}
            className="w-4 h-4 accent-blue-500"
          />
          <label className="text-gray-700">Audio</label>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {!isStartMedia ? (
          <button
            disabled={isStartMedia}
            onClick={handleStartMedia}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Media
          </button>
        ) : (
          <button
            disabled={!isStartMedia || isConnected}
            onClick={handleStopMedia}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop Media
          </button>
        )}

        {!isConnected ? (
          <button
            disabled={isConnected || !isStartMedia}
            onClick={handleConnect}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect
          </button>
        ) : (
          <button
            disabled={!isConnected || !isStartMedia}
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Disconnect
          </button>
        )}

        {/* {isShareScreen ? (
          <button
            disabled={!isStartMedia || !isConnected}
            onClick={handleDisconnectScreenShare}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop Screen Share
          </button>
        ) : (
          <button
            disabled={!isStartMedia || !isConnected}
            onClick={handleStartScreenShare}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Share Screen
          </button>
        )} */}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Local Video</h2>
        <div className="flex gap-4">
          <video
            ref={localVideo}
            autoPlay
            controls
            className="w-[320px] h-[240px] rounded-lg shadow-md bg-gray-100"
          ></video>
          {/* <video
            ref={localScreen}
            controls
            autoPlay
            className="w-[320px] h-[240px] rounded-lg shadow-md bg-gray-100"
          ></video> */}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Remote Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {console.log(remoteVideos) ?? null}
          {Object.keys(remoteVideos).map((key: any, index: number) => {
            return Object.keys(remoteVideos[key]).map(
              (key2: any, index2: number) => {
                const peer: any = remoteVideos[key][key2];
                return (
                  <MemoizedCreateRemoteVideos
                    key={peer.socket_id + "__" + key2}
                    peer={peer}
                    playVideo={playVideo}
                  />
                );
              }
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MeetRoom;
