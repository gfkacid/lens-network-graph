const TEXT_COLOR = "#000000";

/**
 * This function draw in the input canvas 2D context a rectangle.
 * It only deals with tracing the path, and does not fill or stroke.
 */
export function drawRoundRect( ctx, x, y, width, height, radius ) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Custom hover renderer
 */
export function drawHover(context, data, settings) {

  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const connectionTypeLabelSize = size - 2;

  const label = data.label;
  const connectionTypeLabel = data.clusterLabel;//data.tag !== "unknown" ? data.tag : "";
  const statsLabel = data.statsLabel;

  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";

  context.font = `${weight} ${size}px ${font}`;
  const labelWidth = context.measureText(label).width;
  context.font = `${weight} ${connectionTypeLabelSize}px ${font}`;
  const connectionTypeLabelWidth = connectionTypeLabel ? context.measureText(connectionTypeLabel).width : 0;
  context.font = `${weight} ${connectionTypeLabelSize}px ${font}`;
  const statsLabelWidth = statsLabel ? context.measureText(statsLabel).width : 0;

  const textWidth = Math.max(labelWidth, connectionTypeLabelWidth, statsLabelWidth);

  const x = Math.round(data.x);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + size / 2 + data.size + 3);
  const hLabel = Math.round(size / 2 + 4);
  const hconnectionTypeLabel = connectionTypeLabel ? Math.round(connectionTypeLabelSize / 2 + 9) : 0;
  const hstatsLabel = Math.round(connectionTypeLabelSize / 2 + 9);

  drawRoundRect(context, x, y - hconnectionTypeLabel - 12, w, hstatsLabel + hLabel + hconnectionTypeLabel + 12, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // And finally we draw the labels
  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(label, data.x + data.size + 3, data.y + size / 3);

  if (connectionTypeLabel) {
    context.fillStyle = data.color;
    context.font = `${weight} ${connectionTypeLabelSize}px ${font}`;
    context.fillText(connectionTypeLabel, data.x + data.size + 3, data.y - (2 * size) / 3 - 2);
  }

  context.fillStyle = data.color;
  context.font = `${weight} ${connectionTypeLabelSize}px ${font}`;
  context.fillText(statsLabel, data.x + data.size + 3, data.y + size / 3 + 3 + connectionTypeLabelSize);
}

/**
 * Custom label renderer
 */
export default function drawLabel(context, data, settings) {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;
  const width = context.measureText(data.label).width + 8;

  context.fillStyle = "#ffffffcc";
  context.fillRect(data.x + data.size, data.y + size / 3 - 15, width, 20);

  context.fillStyle = "#000";
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}
