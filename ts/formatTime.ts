export default function formatTime(start: Date, end: Date) {
    const startMs = start.getTime();
    const endMs = end.getTime();

    let h = endMs - startMs;

    const ms = h % 1000;
    h = (h - ms) / 1000;
    const s = h % 60;
    h = (h - s) / 60;
    const m = h % 60;
    h = (h - m) / 60;
    return `${h}h ${m}m ${s + ms / 1000.0}s`;
}
