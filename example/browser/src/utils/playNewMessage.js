import notice from '@/assets/audio/notice.mp3'

export default function playNewMessage () {
  const audio = document.createElement('audio')
  audio.src = notice
  document.body.append(audio)
  audio.play()
  audio.onended = function () {
    audio.remove()
  }
}
