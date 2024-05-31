<template>
  <div class="video-container" @click="togglePlay">
    <video ref="videoRef" muted loop>
      <source :src="src" :type="type" />
      Your browser does not support the video tag.
    </video>
    <transition name="fade">
      <div v-if="showOverlay" class="overlay">
        <span class="icon">{{ currentIcon }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      observer: null,
      isPaused: false,
      showOverlay: false,
      currentIcon: "", // No icon by default
    };
  },
  props: {
    src: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "video/mp4",
    },
  },
  watch: {
    isPaused(newVal) {
      if (newVal) {
        this.currentIcon = "▶️";
        this.showOverlay = true;
      } else {
        this.currentIcon = "🏃";
        setTimeout(() => {
          this.showOverlay = false;
        }, 500);
      }
    },
  },
  mounted() {
    this.initObserver();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    togglePlay() {
      const videoElement = this.$refs.videoRef;
      if (videoElement.paused) {
        videoElement.play();
        this.isPaused = false;
      } else {
        videoElement.pause();
        this.isPaused = true;
      }
    },
    initObserver() {
      const options = {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      };

      this.observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.$refs.videoRef.play();
            observer.disconnect();
          }
        });
      }, options);

      this.observer.observe(this.$refs.videoRef);
    },
  },
};
</script>

<style scoped>
.video-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  cursor: pointer;
}

video {
  width: 100%;
  height: auto;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
}

.icon {
  color: white;
  transition: transform 0.3s;
  transform: scale(1);
}

video::-webkit-media-controls {
  display: none !important;
}
video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>
