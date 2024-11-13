export default function wrapText(text, maxLineLength) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";

    words.forEach(word => {
        while (word.length > maxLineLength) {
            const part = word.slice(0, maxLineLength - 1) + "-";
            lines.push(currentLine + part);
            word = word.slice(maxLineLength - 1);
            currentLine = "";
        }

        if ((currentLine + (currentLine ? " " : "") + word).length > maxLineLength) {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        } else {
            currentLine += (currentLine ? " " : "") + word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.join("\n            ");
}