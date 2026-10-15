const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const lingerieProducts = [
  {
    id: 'boudoir-pasties',
    title: 'Boudoir Pasties',
    badge: 'SATIN & VELVET',
    sku: 'LINGERIE · 01',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Playful satin and velvet nipple pasties featuring flirty boudoir motifs and provocative script. Crafted with medical-grade hypoallergenic adhesive for secure, skin-safe wear and effortless peel-away removal.',
    heroSource: 'PHOTO-2026-08-14-17-43-41.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-14-17-43-41.jpg', label: 'Pasties Collection' },
      { file: 'PHOTO-2026-08-14-17-43-42.jpg', label: 'Detail View' },
      { file: 'PHOTO-2026-08-14-17-43-43.jpg', label: 'Alternate View' }
    ]
  },
  {
    id: 'zebra-set',
    title: 'Zebra Set',
    badge: '3-PIECE SET',
    sku: 'LINGERIE · 02',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Untamed scarlet zebra-print lingerie ensemble featuring a structured underwire demi bra, matching strappy G-string, opera-length sheer mesh gloves, and coordinating thigh-high stockings for an unforgettable wild encounter.',
    heroSource: 'PHOTO-2026-08-14-17-45-25.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-14-17-45-25.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-08-14-17-45-26.jpg', label: 'Full Ensemble' },
      { file: 'PHOTO-2026-08-14-17-45-27.jpg', label: 'Detail Angle' }
    ]
  },
  {
    id: 'lilac-bodystocking',
    title: 'Lilac Bodystocking',
    badge: 'SEAMLESS KNIT',
    sku: 'LINGERIE · 03',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Ethereal lavender open-knit bodystocking with ribbed contour paneling, delicate long sleeves, and tantalizing peekaboo decolletage cutouts. Ultra-stretchy micro-mesh hugs every natural curve like liquid silk.',
    heroSource: 'PHOTO-2026-09-16-14-16-36.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-16-14-16-36.jpg', label: 'Model Front' },
      { file: 'PHOTO-2026-09-16-14-16-37.jpg', label: 'Model Angle' },
      { file: 'PHOTO-2026-08-14-17-47-43.jpg', label: 'Live Mannequin View' },
      { file: 'PHOTO-2026-08-14-17-47-45.jpg', label: 'Back Angle' },
      { file: 'VIDEO-2026-08-14-17-47-48.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'cyan-coord',
    title: 'Cyan Co-ord',
    badge: '2-PIECE SET',
    sku: 'LINGERIE · 04',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Electric cyan two-piece knit set featuring a sparkling rhinestone-embellished long-sleeve crop top with flared bell cuffs and a matching low-rise mini skirt with seductive hip ladder cutouts.',
    heroSource: 'PHOTO-2026-08-14-17-50-33.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-14-17-50-33.jpg', label: 'Model Front' },
      { file: 'PHOTO-2026-08-14-17-50-34.jpg', label: 'Model Side View' },
      { file: 'PHOTO-2026-09-16-14-10-37.jpg', label: 'Studio Shot' },
      { file: 'VIDEO-2026-08-14-17-50-40.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'heart-teddy',
    title: 'Heart Teddy',
    badge: 'HEART CUTOUT',
    sku: 'LINGERIE · 05',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Romantic blush pink teddy featuring heart-shaped embroidered mesh cups, adjustable satin garter straps, and scalloped lace trim. Seductively contours your silhouette while framing your decolletage in sweet allure.',
    heroSource: 'PHOTO-2026-08-19-16-42-45.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-19-16-42-45.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-08-19-16-42-48.jpg', label: 'Model Back View' },
      { file: 'PHOTO-2026-08-19-16-42-38.jpg', label: 'Live Mannequin View' },
      { file: 'VIDEO-2026-08-19-16-44-48.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'noir-slip',
    title: 'Noir Slip',
    badge: 'MAXI SHEER',
    sku: 'LINGERIE · 06',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Dramatic midnight black sheer mesh maxi slip dress with intricate floral eyelash lace underwire cups, adjustable spaghetti straps, and a daring sheer cascade that billows with every sensual step.',
    heroSource: 'PHOTO-2026-08-19-17-04-45.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-19-17-04-45.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-08-19-17-04-46.jpg', label: 'Side Angle' },
      { file: 'PHOTO-2026-08-19-17-04-47.jpg', label: 'Back View' }
    ]
  },
  {
    id: 'scarlet-corset',
    title: 'Scarlet Corset',
    badge: 'LACE-UP BACK',
    sku: 'LINGERIE · 07',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Fiery scarlet backless teddy with a dramatic crisscross corset tie running the full length of the spine. Features a deep sweetheart neckline and high-cut thong back designed to accentuate waist curvature.',
    heroSource: 'PHOTO-2026-08-19-17-14-15.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-19-17-14-15.jpg', label: 'Lace-Up Back' },
      { file: 'PHOTO-2026-08-19-17-14-16.jpg', label: 'Front Angle' },
      { file: 'PHOTO-2026-08-19-17-14-17.jpg', label: 'Side Profile' }
    ]
  },
  {
    id: 'heart-mini',
    title: 'Heart Mini',
    badge: 'CHERRY KNIT',
    sku: 'LINGERIE · 08',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Playful bubblegum pink fishnet mini dress with off-shoulder long sleeves and charming green-stemmed cherry and heart motifs across the neckline. Stretches seamlessly over curves for flirty boudoir lounging.',
    heroSource: 'PHOTO-2026-08-19-17-22-11.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-19-17-22-11.jpg', label: 'Live Front View' },
      { file: 'PHOTO-2026-08-19-17-22-14.jpg', label: 'Side Angle' },
      { file: 'PHOTO-2026-08-19-17-22-15.jpg', label: 'Back Angle' },
      { file: 'VIDEO-2026-08-19-17-22-40.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'royal-slip',
    title: 'Royal Slip',
    badge: 'COBALT LACE',
    sku: 'LINGERIE · 09',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Sultry cobalt royal blue sheer lace chemise featuring an open lace front, plunging triangle cups, built-in garter loops, and a matching G-string. The vibrant sapphire hue elevates every boudoir setting.',
    heroSource: 'PHOTO-2026-08-24-17-30-20.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-24-17-30-20.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-08-24-17-30-21.jpg', label: 'Model Back View' },
      { file: 'PHOTO-2026-08-24-17-27-35.jpg', label: 'Live Mannequin View' }
    ]
  },
  {
    id: 'thigh-stockings',
    title: 'Thigh Stockings',
    badge: 'STAY-UP SILICONE',
    sku: 'LINGERIE · 10',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Classic ultra-sheer thigh-high stockings with wide satin comfort top bands lined with stay-up silicone ribbing. Available in both timeless noir black and bridal alabaster white for seamless pairing with any lingerie ensemble.',
    heroSource: 'PHOTO-2026-08-24-17-31-37.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-24-17-31-37.jpg', label: 'Black & White Pair' },
      { file: 'PHOTO-2026-08-24-17-31-38.jpg', label: 'Black Stocking' },
      { file: 'PHOTO-2026-08-24-17-31-39.jpg', label: 'White Stocking' }
    ]
  },
  {
    id: 'ruby-corset',
    title: 'Ruby Corset',
    badge: 'SATIN BUSTIER',
    sku: 'LINGERIE · 11',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Luxe crimson satin and sheer illusion mesh corseted bodysuit with padded underwire cups, adjustable thigh garter straps, and a matching satin cheeky thong with delicate gold hardware accents.',
    heroSource: 'PHOTO-2026-08-24-17-32-48.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-24-17-32-48.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-08-24-17-32-50.jpg', label: 'Mirror Angle' },
      { file: 'PHOTO-2026-08-24-17-32-51.jpg', label: 'Back View' }
    ]
  },
  {
    id: 'white-bodystocking',
    title: 'White Bodystocking',
    badge: 'DIAMOND CUTOUT',
    sku: 'LINGERIE · 12',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Seductive pure white high-neck bodystocking woven with intricate diamond lattice cutouts and open fishnet thighs. Designed to flatter the hourglass silhouette with dramatic skin reveals from collarbone to hip.',
    heroSource: 'PHOTO-2026-08-24-17-38-02.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-08-24-17-38-02.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-08-24-17-38-03.jpg', label: 'Model Angle' },
      { file: 'PHOTO-2026-08-24-17-36-32.jpg', label: 'Live Mannequin View' }
    ]
  },
  {
    id: 'schoolgirl-set',
    title: 'Schoolgirl Set',
    badge: 'ROLEPLAY COSTUME',
    sku: 'LINGERIE · 13',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Classic boudoir roleplay outfit featuring a pleated red tartan mini skirt, sheer white floral lace tie-front crop top, matching lace choker collar with red ribbon bow, and cheeky lace thong.',
    heroSource: 'PHOTO-2026-09-12-09-57-54.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-12-09-57-54.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-09-12-09-57-55.jpg', label: 'Back Angle' }
    ]
  },
  {
    id: 'floral-gown',
    title: 'Floral Gown',
    badge: 'MAXI SLIT',
    sku: 'LINGERIE · 14',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Whimsical powder blue floral sheer chiffon maxi gown featuring double hip-high front slits that flutter dramatically with every motion, delicate sweetheart bust, and adjustable shoulder ribbons.',
    heroSource: 'PHOTO-2026-09-14-10-24-00 2.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-14-10-24-00 2.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-09-14-10-24-01.jpg', label: 'Side Slit Detail' },
      { file: 'PHOTO-2026-09-14-10-24-02.jpg', label: 'Back View' }
    ]
  },
  {
    id: 'scarlet-gown',
    title: 'Scarlet Gown',
    badge: 'BELTED SATIN',
    sku: 'LINGERIE · 15',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Show-stopping scarlet red sheer mesh and liquid satin evening gown with structured underwire cups, gold buckled waist belt, and an ultra-daring thigh-high slit that commands pure adoration.',
    heroSource: 'PHOTO-2026-09-14-10-30-07.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-14-10-30-07.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-14-10-30-08.jpg', label: 'Slit Detail' },
      { file: 'VIDEO-2026-09-14-10-30-10.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'pink-chemise',
    title: 'Pink Chemise',
    badge: 'ROSE LACE',
    sku: 'LINGERIE · 16',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Delicate blush pink floral lace mini chemise with soft wireless cups, matching satin garter ribbons, and sheer side panels that create a dreamy, romantic boudoir fantasy.',
    heroSource: 'PHOTO-2026-09-14-10-43-37.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-14-10-43-37.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-09-14-10-44-58.jpg', label: 'Side Profile' },
      { file: 'PHOTO-2026-09-14-10-45-26.jpg', label: 'Full Length' }
    ]
  },
  {
    id: 'crochet-set',
    title: 'Crochet Set',
    badge: '2-PIECE SET',
    sku: 'LINGERIE · 17',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Sensual textured open-knit 2-piece loungewear set featuring a short-sleeve crop top and high-waisted seamless leggings. Available in fiery scarlet red and sleek noir black.',
    heroSource: 'PHOTO-2026-09-14-10-48-49.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-14-10-48-49.jpg', label: 'Red Colorway' },
      { file: 'PHOTO-2026-09-14-10-48-51.jpg', label: 'Seated Pose' },
      { file: 'PHOTO-2026-09-14-10-51-40.jpg', label: 'Black Colorway' }
    ]
  },
  {
    id: 'feather-teddy',
    title: 'Feather Teddy',
    badge: 'PLUME ACCENT',
    sku: 'LINGERIE · 18',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Exquisite baby pink ribbed knit bodysuit trimmed with luxurious matching marabou feathers along the shoulder straps and delicate scalloped lace along the plunging bustline and leg openings.',
    heroSource: 'PHOTO-2026-09-14-10-59-25 2.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-14-10-59-25 2.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-14-10-59-26.jpg', label: 'Feather Detail' },
      { file: 'PHOTO-2026-09-14-10-59-27.jpg', label: 'Back Angle' }
    ]
  },
  {
    id: 'corset-babydoll',
    title: 'Corset Babydoll',
    badge: 'NOIR FLARE',
    sku: 'LINGERIE · 19',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Sleek noir black boned corset mini babydoll dress featuring ruffled shoulder cap sleeves, front lace-up eyelets, and a flared pleated skater skirt that twirls provocatively.',
    heroSource: 'PHOTO-2026-09-14-11-13-09.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-14-11-13-09.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-14-11-13-10.jpg', label: 'Side Angle' }
    ]
  },
  {
    id: 'ombre-mini',
    title: 'Ombre Mini',
    badge: 'GRADIENT NET',
    sku: 'LINGERIE · 20',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Hypnotic scarlet-to-black ombre sheer fishnet mini dress with long sleeves, dramatic diamond-weave chest cutouts, and seamless stretch knit that clings sculpturally to every curve.',
    heroSource: 'PHOTO-2026-09-16-13-57-51.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-16-13-57-51.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-16-13-57-53.jpg', label: 'Side Profile' },
      { file: 'PHOTO-2026-09-16-13-57-55.jpg', label: 'Back View' }
    ]
  },
  {
    id: 'pearl-mini',
    title: 'Pearl Mini',
    badge: 'RING CUTOUT',
    sku: 'LINGERIE · 21',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Midnight navy off-shoulder mini dress featuring shimmering silver O-ring and pearl cutout accents down the bust and sleeves, paired with textured animal print sheer mesh side paneling.',
    heroSource: 'PHOTO-2026-09-16-14-05-27.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-16-14-05-27.jpg', label: 'Front Angle' },
      { file: 'PHOTO-2026-09-16-14-05-28.jpg', label: 'Seated Profile' },
      { file: 'PHOTO-2026-09-16-14-05-29.jpg', label: 'Detail View' }
    ]
  },
  {
    id: 'ruby-net',
    title: 'Ruby Net',
    badge: 'SEAMLESS MINI',
    sku: 'LINGERIE · 22',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Alluring deep ruby red seamless fishnet t-shirt mini dress with short sleeves and fine honeycomb mesh that flatters natural contours with an effortless second-skin feel.',
    heroSource: 'PHOTO-2026-09-16-14-23-34.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-16-14-23-34.jpg', label: 'Front Curve' },
      { file: 'PHOTO-2026-09-16-14-23-35.jpg', label: 'Side Profile' },
      { file: 'PHOTO-2026-09-16-14-23-36.jpg', label: 'Back View' }
    ]
  },
  {
    id: 'blush-halter',
    title: 'Blush Halter',
    badge: 'HALTER MINI',
    sku: 'LINGERIE · 23',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Pastel blush pink halter neck fishnet mini dress with an alluring keyhole bust cutout, backless design, and intricate laser-distressed ladder ribbing along the hemline.',
    heroSource: 'PHOTO-2026-09-16-14-26-50.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-16-14-26-50.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-16-14-26-52.jpg', label: 'Backless View' }
    ]
  },
  {
    id: 'ribbon-teddy',
    title: 'Ribbon Teddy',
    badge: 'SATIN BOWS',
    sku: 'LINGERIE · 24',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Vintage-inspired baby pink floral lace bodysuit adorned with charming satin ribbon bows along the plunging decolletage, delicate ruffle leg trims, and coordinating pink fishnet stockings.',
    heroSource: 'PHOTO-2026-09-22-15-36-55 2.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-22-15-36-55 2.jpg', label: 'Boudoir Bed View' },
      { file: 'PHOTO-2026-09-22-15-36-56.jpg', label: 'Stockings Detail' },
      { file: 'VIDEO-2026-09-22-15-36-57.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'heart-romper',
    title: 'Heart Romper',
    badge: 'PASTEL CO-ORD',
    sku: 'LINGERIE · 25',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Sweet and sultry two-tone pastel yellow and lavender mesh halter romper featuring an open back, high-cut cheeky bottoms, and an adorable heart-accented choker neckline.',
    heroSource: 'PHOTO-2026-09-22-15-45-36.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-22-15-45-36.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-09-22-15-45-37.jpg', label: 'Back Angle' },
      { file: 'PHOTO-2026-09-22-15-46-59 2.jpg', label: 'Live Mannequin View' }
    ]
  },
  {
    id: 'lattice-gown',
    title: 'Lattice Gown',
    badge: 'WINE LACE',
    sku: 'LINGERIE · 26',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Sumptuous rich wine red floral lace backless gown featuring intricate lattice crisscross strapping along the hips and thighs, an open rear silhouette, and built-in underwire support.',
    heroSource: 'PHOTO-2026-09-22-15-50-42.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-22-15-50-42.jpg', label: 'Back Lattice View' },
      { file: 'PHOTO-2026-09-22-15-50-43.jpg', label: 'Front Angle' },
      { file: 'VIDEO-2026-09-22-17-11-53.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'teal-mini',
    title: 'Teal Mini',
    badge: 'AQUA NET',
    sku: 'LINGERIE · 27',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Vibrant aqua teal open-work fishnet mini dress with long sleeves, delicate halter tie accent, and an organic webbed texture that frames your shape in striking island colors.',
    heroSource: 'PHOTO-2026-09-23-12-57-35.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-23-12-57-35.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-23-12-57-36.jpg', label: 'Mirror Angle' },
      { file: 'PHOTO-2026-09-23-12-57-38.jpg', label: 'Back View' }
    ]
  },
  {
    id: 'maroon-babydoll',
    title: 'Maroon Babydoll',
    badge: 'RUFFLE CORSET',
    sku: 'LINGERIE · 28',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Deep maroon lace-up corset babydoll with underwire floral lace cups, playful chiffon ruffled mini hemline, lace-up front midsection, and integrated adjustable garter straps.',
    heroSource: 'PHOTO-2026-09-24-15-50-09.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-24-15-50-09.jpg', label: 'Model Front View' },
      { file: 'PHOTO-2026-09-24-15-50-11.jpg', label: 'Model Back View' },
      { file: 'PHOTO-2026-09-24-15-55-59.jpg', label: 'Live Mannequin View' }
    ]
  },
  {
    id: 'kiss-chemise',
    title: 'Kiss Chemise',
    badge: 'EMBROIDERED LIPS',
    sku: 'LINGERIE · 29',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Seductive black sheer mesh babydoll slip embroidered with vibrant red lipstick kiss motifs, satin red center ribbon bow, scalloped lace trim, and matching kiss-print G-string.',
    heroSource: 'PHOTO-2026-09-26-13-11-22.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-26-13-11-22.jpg', label: 'Model Seated' },
      { file: 'PHOTO-2026-09-26-13-06-53.jpg', label: 'Model Standing' },
      { file: 'PHOTO-2026-09-25-12-48-11.jpg', label: 'Live Mannequin View' },
      { file: 'VIDEO-2026-09-25-12-48-11.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'floral-corset',
    title: 'Floral Corset',
    badge: 'GARDEN LACE',
    sku: 'LINGERIE · 30',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Angelic vintage garden floral print corset teddy with pristine white eyelet lace trim along the underwire cups, adjustable garter ribbons with dainty bows, and boned waistline contouring.',
    heroSource: 'PHOTO-2026-09-26-17-30-12.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-26-17-30-12.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-26-17-30-13.jpg', label: 'Side Angle' },
      { file: 'VIDEO-2026-09-26-18-07-23.mp4', label: 'Live Video Clip', type: 'video' }
    ]
  },
  {
    id: 'neon-slip',
    title: 'Neon Slip',
    badge: 'HOT PINK',
    sku: 'LINGERIE · 31',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Striking noir black sheer micro-mesh slip featuring hot neon magenta eyelash lace accents along the bust and scalloped hem, adjustable spaghetti straps, and matching cheeky thong.',
    heroSource: 'PHOTO-2026-09-26-18-17-01.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-26-18-17-01.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-26-18-17-02.jpg', label: 'Side View' }
    ]
  },
  {
    id: 'nurse-set',
    title: 'Nurse Set',
    badge: 'ROLEPLAY COSTUME',
    sku: 'LINGERIE · 32',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Provocative white and red emergency nurse roleplay uniform dress featuring a zippered plunge front, corset waist lattice cutouts, matching nurse headpiece, and attached garter loops.',
    heroSource: 'PHOTO-2026-09-26-18-17-01 2.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-26-18-17-01 2.jpg', label: 'Full Costume' }
    ]
  },
  {
    id: 'mermaid-set',
    title: 'Mermaid Set',
    badge: 'MAXI 2-PIECE',
    sku: 'LINGERIE · 33',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Breathtaking turquoise and lavender gradient knit 2-piece set featuring a high-neck halter crop top with keyhole cutout and a floor-sweeping sheer ombre mermaid skirt.',
    heroSource: 'PHOTO-2026-09-29-16-27-32.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-29-16-27-32.jpg', label: 'Full Set' },
      { file: 'PHOTO-2026-09-29-16-27-33.jpg', label: 'Crop Top Detail' },
      { file: 'PHOTO-2026-09-29-16-27-34.jpg', label: 'Back Angle' }
    ]
  },
  {
    id: 'noir-chemise',
    title: 'Noir Chemise',
    badge: 'FAN EMBROIDERY',
    sku: 'LINGERIE · 34',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Ultra-luxe noir black sheer mini chemise featuring architectural fan-embroidered sheer underwire cups, ruched side seams that sculpt the hips, and a delicate flirty ruffle hem.',
    heroSource: 'PHOTO-2026-09-29-16-29-35.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-29-16-29-35.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-29-16-29-36.jpg', label: 'Back Angle' }
    ]
  },
  {
    id: 'lace-romper',
    title: 'Lace Romper',
    badge: 'FLORAL PLAYSUIT',
    sku: 'LINGERIE · 35',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Sultry noir black floral lace romper playsuit featuring a plunging V-neckline, supportive underbust band, strappy back details, and semi-sheer boy-short bottoms for effortless elegance.',
    heroSource: 'PHOTO-2026-09-29-16-31-43.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-09-29-16-31-43.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-09-29-16-31-44.jpg', label: 'Back Angle' }
    ]
  },
  {
    id: 'cutout-mini',
    title: 'Cutout Mini',
    badge: 'O-RING DETAIL',
    sku: 'LINGERIE · 36',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Architectural sheer noir mesh mini dress featuring a daring circular underboob cutout, high choker neckline, central silver O-ring connector, and an ultra-short sheer skirt.',
    heroSource: 'PHOTO-2026-10-01-09-53-42.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-10-01-09-53-42.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-10-01-09-53-43.jpg', label: 'Back Angle' }
    ]
  },
  {
    id: 'leopard-bodysuit',
    title: 'Leopard Bodysuit',
    badge: 'SLEEVE SET',
    sku: 'LINGERIE · 37',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Exotic warm leopard and blue butterfly print sheer off-shoulder bodysuit featuring strappy hip cutouts with adjustable tie bows and separate matching flared long sleeves.',
    heroSource: 'PHOTO-2026-10-01-10-18-37.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-10-01-10-18-37.jpg', label: 'Front View' },
      { file: 'PHOTO-2026-10-01-10-18-38.jpg', label: 'Back Angle' },
      { file: 'PHOTO-2026-10-01-10-18-39.jpg', label: 'Sleeve Detail' }
    ]
  },
  {
    id: 'chain-teddy',
    title: 'Chain Teddy',
    badge: 'CHAIN HARNESS',
    sku: 'LINGERIE · 38',
    price: 0,
    priceStr: 'Price on Request',
    desc: 'Dominant and exquisite black floral lace teddy elevated with shimmering gold chain shoulder straps and draping bust chains, waist harness belt, and chain-linked thigh garter bands.',
    heroSource: 'PHOTO-2026-10-01-10-21-38.jpg',
    mediaSources: [
      { file: 'PHOTO-2026-10-01-10-21-38.jpg', label: 'Front Harness' },
      { file: 'PHOTO-2026-10-01-10-21-39.jpg', label: 'Back View' }
    ]
  }
];

const srcDir = path.join(__dirname, '../public/assets/Lingerie');
const outDir = path.join(__dirname, '../public/assets/lingerie-catalog');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function convertFile(filename, destName) {
  const fullSrc = path.join(srcDir, filename);
  const fullDest = path.join(outDir, destName);
  if (!fs.existsSync(fullSrc)) {
    console.warn('Source file not found:', fullSrc);
    return false;
  }
  try {
    await sharp(fullSrc, { failOn: 'none' })
      .rotate()
      .resize(1000, 1333, { fit: 'cover', position: 'center' })
      .webp({ quality: 84 })
      .toFile(fullDest);
    return true;
  } catch (err) {
    console.error('Failed to convert', filename, ':', err.message);
    return false;
  }
}

async function run() {
  console.log(`Starting conversion of ${lingerieProducts.length} lingerie products...`);
  for (const prod of lingerieProducts) {
    // 1. Convert hero
    const heroDest = `${prod.id}-hero.webp`;
    await convertFile(prod.heroSource, heroDest);
    prod.heroWebp = `/assets/lingerie-catalog/${heroDest}`;

    // 2. Convert media
    prod.finalMedia = [];
    for (let idx = 0; idx < prod.mediaSources.length; idx++) {
      const m = prod.mediaSources[idx];
      if (m.type === 'video') {
        prod.finalMedia.push({
          type: 'video',
          src: `/assets/Lingerie/${m.file}`,
          label: m.label
        });
      } else {
        const mediaDest = `${prod.id}-media-${idx + 1}.webp`;
        await convertFile(m.file, mediaDest);
        prod.finalMedia.push({
          type: 'image',
          src: `/assets/lingerie-catalog/${mediaDest}`,
          label: m.label
        });
      }
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'processed-lingerie-catalog.json'),
    JSON.stringify(lingerieProducts, null, 2)
  );
  console.log('Finished converting all images! Saved processed-lingerie-catalog.json');
}

run();
