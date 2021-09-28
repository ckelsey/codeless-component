function doubleDigits(time: number) {
    return `00${time}`.slice(-2)
}

export default function SecondsToTimecode(time: number, fps: number) {
    const hours = Math.floor(time / (60 * 60))
    const minutes = (Math.floor(time / 60)) % 60
    const seconds = Math.floor(time) % 60
    const frames = Math.round(time * fps) % fps

    return `${hours > 0 ? `${doubleDigits(hours)}:` : ''}${minutes > 0 ? `${doubleDigits(minutes)}:` : ''}${doubleDigits(seconds)}.${doubleDigits(isNaN(frames) ? 0 : frames)}`
}