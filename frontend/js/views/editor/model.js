// model.js - Defines element schemas and presets for the editor

export const ElementTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  SHAPE: 'shape',
  QR: 'qr',
  WIDGET: 'widget'
};

export const Fonts = [
  'Inter',
  'Roboto',
  'Montserrat',
  'Oswald',
  'Goldman',
  'Open Sans',
  'Lato',
  'Poppins',
  'Playfair Display'
];

export function createPreset(type, subtype = 'default', x = 0, y = 0) {
  const base = {
    id: 'el_' + Date.now() + Math.floor(Math.random() * 1000),
    type: type,
    x: x,
    y: y,
    opacity: 1,
    zIndex: 1,
    visible: true
  };

  switch (type) {
    case ElementTypes.TEXT:
      let presetText = { ...base, fontFamily: 'Inter', color: '#000000', width: 600, height: 100, textAlign: 'left', fontWeight: '400' };
      if (subtype === 'h1') return { ...presetText, content: 'Heading 1', fontSize: 96, fontWeight: '700', height: 120 };
      if (subtype === 'h2') return { ...presetText, content: 'Heading 2', fontSize: 72, fontWeight: '700', height: 90 };
      if (subtype === 'sub') return { ...presetText, content: 'Subheading', fontSize: 48, fontWeight: '400', height: 60 };
      if (subtype === 'small') return { ...presetText, content: 'Small text block here', fontSize: 24, height: 40 };
      // Default body
      return { ...presetText, content: 'Body text goes here. Double click to edit.', fontSize: 36, height: 150 };

    case ElementTypes.IMAGE:
      return { ...base, width: 600, height: 400, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', objectFit: 'cover', borderRadius: 0 };

    case ElementTypes.VIDEO:
      return { ...base, width: 800, height: 450, url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', autoplay: true, muted: true, loop: true };

    case ElementTypes.SHAPE:
      const shape = { ...base, width: 400, height: 400, fill: '#ff6b00', stroke: 'transparent', strokeWidth: 0 };
      if (subtype === 'circle') return { ...shape, shapeType: 'circle' };
      if (subtype === 'line') return { ...shape, width: 800, height: 8, shapeType: 'rect' };
      // Default rect
      return { ...shape, shapeType: 'rect' };

    case ElementTypes.QR:
      return { ...base, width: 300, height: 300, value: 'https://swiftdisplay.com', fgColor: '#000000', bgColor: '#ffffff' };

    case ElementTypes.WIDGET:
      return { ...base, width: 600, height: 200, widgetType: subtype || 'time', config: {} };

    default:
      return base;
  }
}
