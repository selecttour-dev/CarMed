// ============================================================
// Car Makes & Models Database — Hybrid System
// Popular brands: detailed local data (specific models)
// Other brands: NHTSA VPIC API fallback (model classes)
// Logos: filippofilip95/car-logos-dataset (GitHub)
// ============================================================

export interface CarMake {
    brand: string;
    slug: string;
    logo: string;
}

// GitHub raw URL for car logos
const LOGO_BASE = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb';
function logoUrl(slug: string): string {
    return `${LOGO_BASE}/${slug}.png`;
}

// ═══════════════════════════════════════════════════════════════
// Detailed Models for Popular Brands (Georgian market focus)
// ═══════════════════════════════════════════════════════════════
const DETAILED_MODELS: Record<string, string[]> = {
    'Mercedes-Benz': [
        // A Class
        'A 140', 'A 150', 'A 160', 'A 170', 'A 180', 'A 200', 'A 220', 'A 250', 'A 35 AMG', 'A 45 AMG',
        // B Class
        'B 150', 'B 170', 'B 180', 'B 200', 'B 220', 'B 250',
        // C Class
        'C 160', 'C 180', 'C 200', 'C 220', 'C 230', 'C 240', 'C 250', 'C 270', 'C 280', 'C 300', 'C 320', 'C 350', 'C 400', 'C 43 AMG', 'C 63 AMG',
        // CL / CLA / CLK / CLS
        'CL 500', 'CL 600', 'CLA 180', 'CLA 200', 'CLA 220', 'CLA 250', 'CLA 35 AMG', 'CLA 45 AMG',
        'CLK 200', 'CLK 220', 'CLK 230', 'CLK 240', 'CLK 270', 'CLK 280', 'CLK 320', 'CLK 350', 'CLK 430', 'CLK 500', 'CLK 55 AMG', 'CLK 63 AMG',
        'CLS 220', 'CLS 250', 'CLS 300', 'CLS 320', 'CLS 350', 'CLS 400', 'CLS 450', 'CLS 500', 'CLS 53 AMG', 'CLS 55 AMG', 'CLS 63 AMG',
        // E Class
        'E 200', 'E 220', 'E 230', 'E 240', 'E 250', 'E 260', 'E 270', 'E 280', 'E 300', 'E 320', 'E 350', 'E 400', 'E 420', 'E 430', 'E 450', 'E 500', 'E 53 AMG', 'E 55 AMG', 'E 63 AMG',
        // EQ
        'EQA 250', 'EQA 300', 'EQA 350', 'EQB 250', 'EQB 300', 'EQB 350',
        'EQC 400', 'EQE 300', 'EQE 350', 'EQE 500', 'EQE SUV', 'EQS 450', 'EQS 500', 'EQS 580', 'EQS SUV', 'EQV',
        // G Class
        'G 270', 'G 300', 'G 320', 'G 350', 'G 400', 'G 500', 'G 55 AMG', 'G 63 AMG', 'G 65 AMG',
        // GL
        'GL 320', 'GL 350', 'GL 400', 'GL 420', 'GL 450', 'GL 500', 'GL 550', 'GL 63 AMG',
        // GLA
        'GLA 180', 'GLA 200', 'GLA 220', 'GLA 250', 'GLA 35 AMG', 'GLA 45 AMG',
        // GLB
        'GLB 180', 'GLB 200', 'GLB 220', 'GLB 250', 'GLB 35 AMG',
        // GLC
        'GLC 200', 'GLC 220', 'GLC 250', 'GLC 300', 'GLC 350', 'GLC 43 AMG', 'GLC 63 AMG', 'GLC Coupe',
        // GLE
        'GLE 250', 'GLE 300', 'GLE 350', 'GLE 350d', 'GLE 400', 'GLE 43 AMG', 'GLE 450', 'GLE 500', 'GLE 53 AMG', 'GLE 63 AMG', 'GLE 63 S AMG', 'GLE Coupe',
        // GLK
        'GLK 200', 'GLK 220', 'GLK 250', 'GLK 280', 'GLK 300', 'GLK 320', 'GLK 350',
        // GLS
        'GLS 350', 'GLS 400', 'GLS 450', 'GLS 500', 'GLS 580', 'GLS 600 Maybach', 'GLS 63 AMG',
        // ML
        'ML 230', 'ML 250', 'ML 270', 'ML 280', 'ML 300', 'ML 320', 'ML 350', 'ML 400', 'ML 420', 'ML 450', 'ML 500', 'ML 55 AMG', 'ML 63 AMG',
        // R
        'R 280', 'R 300', 'R 320', 'R 350', 'R 500', 'R 63 AMG',
        // S Class / Maybach
        'S 280', 'S 300', 'S 320', 'S 350', 'S 400', 'S 420', 'S 430', 'S 450', 'S 500', 'S 550', 'S 560', 'S 580', 'S 600', 'S 63 AMG', 'S 65 AMG',
        'S 580 Maybach', 'S 680 Maybach',
        // SL / SLC / SLK
        'SL 280', 'SL 300', 'SL 320', 'SL 350', 'SL 400', 'SL 43 AMG', 'SL 500', 'SL 55 AMG', 'SL 63 AMG', 'SL 65 AMG',
        'SLC 180', 'SLC 200', 'SLC 250', 'SLC 300', 'SLC 43 AMG',
        'SLK 200', 'SLK 230', 'SLK 250', 'SLK 280', 'SLK 300', 'SLK 320', 'SLK 350', 'SLK 55 AMG',
        'SLR McLaren', 'SLS AMG',
        // AMG GT
        'AMG GT', 'AMG GT 4-Door', 'AMG GT C', 'AMG GT R', 'AMG GT S', 'AMG GT Black Series', 'AMG ONE',
        // Vans
        'Citan', 'eSprinter', 'Sprinter', 'V 220', 'V 250', 'V 300', 'Viano', 'Vito',
        // CLE
        'CLE 200', 'CLE 300', 'CLE 450', 'CLE 53 AMG',
    ],
    'BMW': [
        // 1 Series
        '114', '116', '118', '120', '123', '125', '128', '130', '135', 'M135i', 'M140i',
        // 2 Series
        '218', '220', '225', '228', '230', '235', 'M235i', 'M240i',
        // 3 Series
        '315', '316', '318', '320', '323', '325', '328', '330', '335', '340', 'M340i',
        // 4 Series
        '418', '420', '425', '428', '430', '435', '440', 'M440i',
        // 5 Series
        '518', '520', '523', '525', '528', '530', '535', '540', '545', '550', 'M550i',
        // 6 Series
        '620', '630', '640', '645', '650',
        // 7 Series
        '725', '728', '730', '735', '740', '745', '750', '760',
        // 8 Series
        '840', '850', 'M850i',
        // X Series
        'X1 sDrive18', 'X1 sDrive20', 'X1 xDrive20', 'X1 xDrive25', 'X1 xDrive28',
        'X2 sDrive18', 'X2 sDrive20', 'X2 xDrive20', 'X2 xDrive25', 'X2 M35i',
        'X3 sDrive20', 'X3 xDrive20', 'X3 xDrive25', 'X3 xDrive28', 'X3 xDrive30', 'X3 xDrive35', 'X3 M', 'X3 M40i',
        'X4 xDrive20', 'X4 xDrive25', 'X4 xDrive28', 'X4 xDrive30', 'X4 xDrive35', 'X4 M', 'X4 M40i',
        'X5 xDrive25', 'X5 xDrive30', 'X5 xDrive35', 'X5 xDrive40', 'X5 xDrive45', 'X5 xDrive48', 'X5 xDrive50', 'X5 M', 'X5 M50i',
        'X6 xDrive30', 'X6 xDrive35', 'X6 xDrive40', 'X6 xDrive50', 'X6 M', 'X6 M50i',
        'X7 xDrive30', 'X7 xDrive40', 'X7 xDrive50', 'X7 M60i',
        // Z
        'Z3 1.8', 'Z3 2.0', 'Z3 2.2', 'Z3 2.8', 'Z3 3.0', 'Z3 M',
        'Z4 sDrive20', 'Z4 sDrive28', 'Z4 sDrive30', 'Z4 sDrive35', 'Z4 M', 'Z4 M40i',
        // M
        'M2', 'M2 Competition', 'M3', 'M3 Competition', 'M4', 'M4 Competition', 'M5', 'M5 Competition', 'M6', 'M8', 'M8 Competition',
        // i / Electric
        'i3', 'i4 eDrive35', 'i4 eDrive40', 'i4 M50', 'i5', 'i7 xDrive60', 'i7 M70',
        'iX xDrive40', 'iX xDrive50', 'iX M60', 'iX1', 'iX3',
    ],
    'Toyota': [
        '4Runner', 'Alphard', 'Auris', 'Avalon', 'Avensis', 'Aygo', 'bZ4X',
        'C-HR', 'Camry 2.0', 'Camry 2.5', 'Camry 3.0', 'Camry 3.5', 'Celica',
        'Corolla 1.3', 'Corolla 1.6', 'Corolla 1.8', 'Corolla 2.0', 'Corolla Cross', 'Corolla Verso', 'Corona', 'Cressida', 'Crown',
        'FJ Cruiser', 'Fortuner', 'GR86', 'GR Yaris', 'GT86',
        'Harrier', 'Hiace', 'Highlander', 'Hilux',
        'Land Cruiser 70', 'Land Cruiser 80', 'Land Cruiser 100', 'Land Cruiser 150', 'Land Cruiser 200', 'Land Cruiser 300',
        'Land Cruiser Prado 90', 'Land Cruiser Prado 120', 'Land Cruiser Prado 150',
        'Mark II', 'Mark X', 'MR2',
        'Prius', 'Prius+', 'Prius Alpha', 'Prius Prime',
        'RAV4 2.0', 'RAV4 2.2', 'RAV4 2.4', 'RAV4 2.5', 'RAV4 Hybrid', 'RAV4 Prime', 'RAV4 Adventure',
        'Sequoia', 'Sienna', 'Starlet', 'Supra',
        'Tacoma', 'Tundra', 'Vellfire', 'Venza', 'Verso',
        'Yaris', 'Yaris Cross', 'Yaris GR',
    ],
    'Hyundai': [
        'Accent', 'Atos', 'Avante', 'Azera',
        'Bayon', 'Casper', 'Creta',
        'Elantra 1.6', 'Elantra 1.8', 'Elantra 2.0', 'Elantra N', 'Elantra Hybrid',
        'Galloper', 'Genesis Coupe', 'Getz', 'Grandeur', 'Grand Santa Fe', 'Grand Starex',
        'i10', 'i20', 'i20 N', 'i30', 'i30 N', 'i40', 'i40 CW',
        'Ioniq', 'Ioniq 5', 'Ioniq 5 N', 'Ioniq 6', 'ix20', 'ix35', 'ix55',
        'Kona', 'Kona Electric', 'Kona N', 'Kona Hybrid',
        'Matrix', 'Nexo',
        'Palisade', 'Santa Cruz', 'Santa Fe 2.0', 'Santa Fe 2.2', 'Santa Fe 2.4', 'Santa Fe 2.7', 'Santa Fe 3.3', 'Santa Fe Hybrid',
        'Solaris', 'Sonata 2.0', 'Sonata 2.4', 'Sonata 2.5', 'Sonata 3.3', 'Sonata Hybrid', 'Sonata N Line',
        'Staria', 'Starex',
        'Terracan', 'Trajet',
        'Tucson 1.6', 'Tucson 2.0', 'Tucson 2.4', 'Tucson 2.7', 'Tucson Hybrid', 'Tucson N Line',
        'Veloster', 'Veloster N', 'Venue', 'Veracruz',
    ],
    'Kia': [
        'Carens', 'Carnival', 'Ceed', 'Ceed GT', 'Ceed SW',
        'Cerato 1.6', 'Cerato 2.0', 'Cerato Koup',
        'EV6', 'EV6 GT', 'EV9',
        'Forte', 'K3', 'K5 2.0', 'K5 2.5', 'K5 GT', 'K7', 'K8', 'K9',
        'Magentis', 'Mohave', 'Morning',
        'Niro', 'Niro EV', 'Niro Hybrid', 'Niro PHEV',
        'Opirus', 'Optima 2.0', 'Optima 2.4',
        'Picanto', 'Pride',
        'Rio 1.2', 'Rio 1.4', 'Rio 1.6',
        'Seltos', 'Shuma',
        'Sorento 2.0', 'Sorento 2.2', 'Sorento 2.4', 'Sorento 2.5', 'Sorento 3.3', 'Sorento 3.5', 'Sorento Hybrid',
        'Soul', 'Soul EV',
        'Sportage 1.6', 'Sportage 2.0', 'Sportage 2.4', 'Sportage 2.7', 'Sportage Hybrid', 'Sportage GT-Line',
        'Stinger 2.0', 'Stinger 2.5', 'Stinger 3.3',
        'Telluride', 'Venga',
        'XCeed',
    ],
    'Lexus': [
        'CT 200h',
        'ES 250', 'ES 300', 'ES 300h', 'ES 330', 'ES 350',
        'GS 200t', 'GS 250', 'GS 300', 'GS 350', 'GS 430', 'GS 450h', 'GS 460', 'GS F',
        'GX 460', 'GX 470', 'GX 550',
        'IS 200', 'IS 200t', 'IS 220d', 'IS 250', 'IS 300', 'IS 300h', 'IS 350', 'IS 500', 'IS F',
        'LC 500', 'LC 500h', 'LFA',
        'LS 400', 'LS 430', 'LS 460', 'LS 500', 'LS 500h', 'LS 600h',
        'LX 450', 'LX 470', 'LX 500d', 'LX 570', 'LX 600',
        'NX 200t', 'NX 250', 'NX 300', 'NX 300h', 'NX 350', 'NX 350h', 'NX 400h+', 'NX 450h+',
        'RC 200t', 'RC 300', 'RC 350', 'RC F',
        'RX 200t', 'RX 270', 'RX 300', 'RX 330', 'RX 350', 'RX 350h', 'RX 400h', 'RX 450h', 'RX 450h+', 'RX 500h',
        'RZ 450e',
        'SC 300', 'SC 400', 'SC 430',
        'UX 200', 'UX 250h', 'UX 300e',
    ],
    'Audi': [
        'A1', 'A1 Sportback',
        'A3 1.4', 'A3 1.6', 'A3 1.8', 'A3 2.0', 'A3 Sportback', 'A3 Sedan', 'A3 Cabriolet',
        'A4 1.4', 'A4 1.8', 'A4 2.0', 'A4 2.5', 'A4 3.0', 'A4 3.2', 'A4 Allroad', 'A4 Avant',
        'A5 2.0', 'A5 3.0', 'A5 Sportback', 'A5 Cabriolet', 'A5 Coupe',
        'A6 1.8', 'A6 2.0', 'A6 2.4', 'A6 2.5', 'A6 2.7', 'A6 2.8', 'A6 3.0', 'A6 3.2', 'A6 4.2', 'A6 Allroad', 'A6 Avant',
        'A7 2.8', 'A7 3.0', 'A7 Sportback',
        'A8 2.5', 'A8 2.8', 'A8 3.0', 'A8 3.3', 'A8 3.7', 'A8 4.0', 'A8 4.2', 'A8 6.0', 'A8 L',
        'e-tron 50', 'e-tron 55', 'e-tron GT', 'e-tron S',
        'Q2 1.0', 'Q2 1.4', 'Q2 2.0',
        'Q3 1.4', 'Q3 2.0', 'Q3 Sportback',
        'Q4 e-tron 35', 'Q4 e-tron 40', 'Q4 e-tron 50',
        'Q5 2.0', 'Q5 3.0', 'Q5 Sportback', 'Q5 e-tron',
        'Q7 2.0', 'Q7 3.0', 'Q7 3.6', 'Q7 4.2', 'Q7 e-tron',
        'Q8 3.0', 'Q8 4.0', 'Q8 e-tron',
        'R8 4.2', 'R8 5.2', 'R8 Spyder',
        'RS3', 'RS4', 'RS4 Avant', 'RS5', 'RS5 Sportback', 'RS6', 'RS6 Avant', 'RS7', 'RS Q3', 'RS Q8', 'RS e-tron GT',
        'S3', 'S4', 'S4 Avant', 'S5', 'S5 Sportback', 'S6', 'S7', 'S8', 'SQ2', 'SQ5', 'SQ7', 'SQ8',
        'TT 1.8', 'TT 2.0', 'TT 3.2', 'TT RS', 'TT S', 'TT Roadster',
    ],
    'Volkswagen': [
        'Amarok', 'Arteon', 'Arteon Shooting Brake', 'Atlas', 'Atlas Cross Sport',
        'Beetle', 'Bora',
        'Caddy', 'Caddy Van', 'California', 'Caravelle', 'CC',
        'Crafter', 'CrossPolo',
        'e-Golf', 'e-Up',
        'Fox',
        'Golf 1.0', 'Golf 1.2', 'Golf 1.4', 'Golf 1.6', 'Golf 2.0', 'Golf GTD', 'Golf GTE', 'Golf GTI', 'Golf R', 'Golf Sportsvan', 'Golf Variant',
        'ID.3', 'ID.4', 'ID.4 GTX', 'ID.5', 'ID.5 GTX', 'ID.Buzz',
        'Jetta 1.4', 'Jetta 1.6', 'Jetta 2.0', 'Jetta 2.5',
        'Lupo', 'Multivan',
        'New Beetle',
        'Passat 1.4', 'Passat 1.6', 'Passat 1.8', 'Passat 2.0', 'Passat 2.5', 'Passat 3.6', 'Passat Alltrack', 'Passat CC', 'Passat Variant',
        'Phaeton',
        'Polo 1.0', 'Polo 1.2', 'Polo 1.4', 'Polo 1.6', 'Polo GTI',
        'Scirocco', 'Sharan',
        'T-Cross', 'T-Roc', 'T-Roc Cabriolet',
        'Taigo', 'Taos',
        'Tiguan 1.4', 'Tiguan 2.0', 'Tiguan Allspace', 'Tiguan R',
        'Touareg 2.0', 'Touareg 3.0', 'Touareg 3.6', 'Touareg 4.2', 'Touareg R',
        'Touran', 'Transporter', 'Up!',
    ],
    'Nissan': [
        '100NX', '200SX', '300ZX', '350Z', '370Z',
        'Almera', 'Almera Tino', 'Altima',
        'Ariya', 'Armada',
        'Frontier',
        'GT-R', 'GT-R Nismo',
        'Juke 1.0', 'Juke 1.2', 'Juke 1.5', 'Juke 1.6', 'Juke Nismo',
        'Kicks', 'King Cab',
        'Leaf', 'Leaf e+',
        'Maxima', 'Micra', 'Murano',
        'Navara', 'Note', 'NP300', 'NV200', 'NV300',
        'Pathfinder', 'Patrol 2.8', 'Patrol 3.0', 'Patrol 4.0', 'Patrol 4.2', 'Patrol 4.8', 'Patrol 5.6',
        'Primera', 'Pulsar',
        'Qashqai 1.2', 'Qashqai 1.3', 'Qashqai 1.5', 'Qashqai 1.6', 'Qashqai 2.0', 'Qashqai e-Power',
        'Rogue', 'Rogue Sport',
        'Sentra', 'Serena', 'Skyline', 'Sunny',
        'Terra', 'Terrano', 'Tiida', 'Titan',
        'Versa',
        'X-Trail 1.6', 'X-Trail 2.0', 'X-Trail 2.5', 'X-Trail e-Power',
        'Z', 'Z Nismo',
    ],
    'Ford': [
        'B-Max', 'Bronco', 'Bronco Sport',
        'C-Max', 'Cougar',
        'EcoSport', 'Edge', 'Escape', 'Escort', 'Everest', 'Excursion', 'Expedition', 'Explorer 2.3', 'Explorer 3.0', 'Explorer 3.5',
        'F-150', 'F-150 Lightning', 'F-150 Raptor', 'F-250', 'F-350',
        'Fiesta 1.0', 'Fiesta 1.1', 'Fiesta 1.4', 'Fiesta 1.5', 'Fiesta 1.6', 'Fiesta ST',
        'Flex', 'Focus 1.0', 'Focus 1.4', 'Focus 1.5', 'Focus 1.6', 'Focus 2.0', 'Focus 2.3', 'Focus RS', 'Focus ST',
        'Fusion', 'Galaxy',
        'Ka', 'Kuga 1.5', 'Kuga 2.0', 'Kuga 2.5', 'Kuga Hybrid',
        'Maverick', 'Mondeo 1.0', 'Mondeo 1.5', 'Mondeo 1.6', 'Mondeo 2.0', 'Mondeo 2.2', 'Mondeo 2.5',
        'Mustang 2.3', 'Mustang 3.7', 'Mustang 5.0', 'Mustang GT', 'Mustang Mach-E', 'Mustang Shelby',
        'Puma', 'Ranger', 'Ranger Raptor',
        'S-Max', 'Taurus', 'Transit', 'Transit Connect', 'Transit Custom',
    ],
    'Honda': [
        'Accord 1.6', 'Accord 2.0', 'Accord 2.2', 'Accord 2.4', 'Accord 3.0', 'Accord 3.5', 'Accord Hybrid',
        'City', 'Civic 1.4', 'Civic 1.5', 'Civic 1.6', 'Civic 1.8', 'Civic 2.0', 'Civic 2.2', 'Civic Hybrid', 'Civic Type R', 'Civic Sedan', 'Civic Hatchback',
        'CR-V 1.5', 'CR-V 1.6', 'CR-V 2.0', 'CR-V 2.2', 'CR-V 2.4', 'CR-V Hybrid',
        'CR-Z', 'e:Ny1',
        'Fit', 'FR-V', 'HR-V', 'HR-V Hybrid',
        'Insight', 'Integra', 'Jazz', 'Jazz Hybrid',
        'Legend', 'NSX',
        'Odyssey', 'Passport', 'Pilot', 'Prelude',
        'Ridgeline', 'S2000', 'Shuttle', 'Stream',
        'ZR-V', 'ZR-V Hybrid',
    ],
    'Subaru': [
        'Ascent', 'BRZ',
        'Crosstrek', 'Crosstrek Hybrid',
        'Forester 2.0', 'Forester 2.5', 'Forester XT', 'Forester Hybrid',
        'Impreza 1.5', 'Impreza 1.6', 'Impreza 2.0', 'Impreza 2.5', 'Impreza WRX',
        'Justy', 'Legacy 2.0', 'Legacy 2.5', 'Legacy 3.0', 'Legacy 3.6', 'Legacy Outback',
        'Levorg', 'Outback 2.5', 'Outback 3.6', 'Outback Hybrid',
        'Solterra', 'SVX', 'Tribeca',
        'WRX', 'WRX STI', 'XV', 'XV Hybrid',
    ],
    'Mazda': [
        '2 1.3', '2 1.5', '3 1.5', '3 2.0', '3 2.5', '5', '6 2.0', '6 2.2', '6 2.5',
        'CX-3', 'CX-30', 'CX-30 e-Skyactiv',
        'CX-5 2.0', 'CX-5 2.2', 'CX-5 2.5',
        'CX-50', 'CX-60', 'CX-60 PHEV',
        'CX-7', 'CX-8', 'CX-9', 'CX-90', 'CX-90 PHEV',
        'Demio',
        'MX-5 1.5', 'MX-5 2.0', 'MX-5 RF',
        'MX-30', 'MX-30 e-Skyactiv',
        'RX-7', 'RX-8',
    ],
    'Porsche': [
        '718 Boxster', '718 Boxster S', '718 Boxster GTS', '718 Boxster Spyder',
        '718 Cayman', '718 Cayman S', '718 Cayman GTS', '718 Cayman GT4', '718 Cayman GT4 RS',
        '911 Carrera', '911 Carrera S', '911 Carrera 4', '911 Carrera 4S', '911 Carrera GTS', '911 Targa', '911 Targa 4S', '911 Turbo', '911 Turbo S', '911 GT3', '911 GT3 RS', '911 GT2 RS', '911 Dakar',
        'Cayenne', 'Cayenne S', 'Cayenne GTS', 'Cayenne Turbo', 'Cayenne Turbo GT', 'Cayenne E-Hybrid', 'Cayenne Coupe',
        'Macan', 'Macan S', 'Macan GTS', 'Macan T', 'Macan Turbo', 'Macan Electric',
        'Panamera', 'Panamera 4', 'Panamera S', 'Panamera GTS', 'Panamera Turbo', 'Panamera Turbo S', 'Panamera E-Hybrid',
        'Taycan', 'Taycan 4S', 'Taycan GTS', 'Taycan Turbo', 'Taycan Turbo S', 'Taycan Cross Turismo',
    ],
    'Volvo': [
        'C30', 'C40 Recharge', 'C70',
        'EX30', 'EX90',
        'S40', 'S60 T3', 'S60 T4', 'S60 T5', 'S60 T6', 'S60 T8', 'S60 Recharge',
        'S80 2.4', 'S80 2.5', 'S80 3.0', 'S80 3.2', 'S80 4.4',
        'S90 T4', 'S90 T5', 'S90 T6', 'S90 T8', 'S90 Recharge',
        'V40', 'V40 Cross Country', 'V50', 'V60', 'V60 Cross Country', 'V60 Recharge', 'V70', 'V90', 'V90 Cross Country',
        'XC40 T2', 'XC40 T3', 'XC40 T4', 'XC40 T5', 'XC40 Recharge',
        'XC60 T4', 'XC60 T5', 'XC60 T6', 'XC60 T8', 'XC60 Recharge',
        'XC70', 'XC90 T5', 'XC90 T6', 'XC90 T8', 'XC90 Recharge',
    ],
    'Land Rover': [
        'Defender 90', 'Defender 110', 'Defender 130', 'Defender V8',
        'Discovery 2.0', 'Discovery 3.0', 'Discovery 4.0', 'Discovery 4.4', 'Discovery HSE', 'Discovery R-Dynamic',
        'Discovery Sport', 'Discovery Sport P200', 'Discovery Sport P250',
        'Freelander 1.8', 'Freelander 2.0', 'Freelander 2.2', 'Freelander 2.5',
        'Range Rover 3.0', 'Range Rover 4.2', 'Range Rover 4.4', 'Range Rover 5.0', 'Range Rover Autobiography', 'Range Rover HSE', 'Range Rover Vogue',
        'Range Rover Evoque P200', 'Range Rover Evoque P250', 'Range Rover Evoque P300',
        'Range Rover Sport 2.0', 'Range Rover Sport 3.0', 'Range Rover Sport 4.4', 'Range Rover Sport 5.0', 'Range Rover Sport SVR',
        'Range Rover Velar P250', 'Range Rover Velar P300', 'Range Rover Velar P340', 'Range Rover Velar P380',
    ],
    'Chevrolet': [
        'Aveo 1.2', 'Aveo 1.4', 'Aveo 1.6',
        'Blazer', 'Bolt EV', 'Bolt EUV',
        'Camaro 2.0T', 'Camaro 3.6', 'Camaro 6.2', 'Camaro SS', 'Camaro ZL1',
        'Captiva', 'Cobalt', 'Colorado',
        'Corvette C5', 'Corvette C6', 'Corvette C7', 'Corvette C8', 'Corvette Z06', 'Corvette ZR1',
        'Cruze 1.4', 'Cruze 1.6', 'Cruze 1.8', 'Cruze 2.0',
        'Equinox', 'Epica',
        'Lacetti', 'Lacetti SW',
        'Malibu', 'Matiz', 'Nubira', 'Niva',
        'Orlando', 'Silverado',
        'Spark 0.8', 'Spark 1.0', 'Spark 1.2',
        'Suburban', 'Tahoe', 'Tracker', 'TrailBlazer', 'Traverse', 'Trax',
    ],
    'Tesla': [
        'Cybertruck', 'Cybertruck AWD', 'Cybertruck Cyberbeast',
        'Model 3', 'Model 3 Standard Range', 'Model 3 Long Range', 'Model 3 Performance', 'Model 3 Highland',
        'Model S', 'Model S Long Range', 'Model S Plaid',
        'Model X', 'Model X Long Range', 'Model X Plaid',
        'Model Y', 'Model Y Standard Range', 'Model Y Long Range', 'Model Y Performance',
        'Roadster',
    ],
    'Jeep': [
        'Cherokee 2.0', 'Cherokee 2.4', 'Cherokee 3.2', 'Cherokee 3.7',
        'Commander', 'Compass',
        'Gladiator', 'Grand Cherokee 3.0', 'Grand Cherokee 3.6', 'Grand Cherokee 4.7', 'Grand Cherokee 5.7', 'Grand Cherokee 6.4', 'Grand Cherokee L', 'Grand Cherokee SRT', 'Grand Cherokee Trackhawk', 'Grand Cherokee 4xe',
        'Grand Wagoneer', 'Patriot', 'Renegade',
        'Wagoneer', 'Wrangler', 'Wrangler 4xe', 'Wrangler Rubicon', 'Wrangler Sahara', 'Wrangler Unlimited',
    ],
    'Mitsubishi': [
        'ASX', 'Carisma', 'Colt',
        'Eclipse', 'Eclipse Cross', 'Eclipse Cross PHEV',
        'Galant', 'Grandis',
        'L200', 'L200 Triton', 'L300',
        'Lancer 1.3', 'Lancer 1.5', 'Lancer 1.6', 'Lancer 1.8', 'Lancer 2.0', 'Lancer Evolution',
        'Outlander 2.0', 'Outlander 2.2', 'Outlander 2.4', 'Outlander 3.0', 'Outlander PHEV',
        'Pajero 2.5', 'Pajero 2.8', 'Pajero 3.0', 'Pajero 3.2', 'Pajero 3.5', 'Pajero 3.8',
        'Pajero Sport 2.4', 'Pajero Sport 2.5', 'Pajero Sport 3.0',
        'Space Star', 'Xpander',
    ],
};

// ═══════════════════════════════════════════════════════════════
// Brand Registry
// ═══════════════════════════════════════════════════════════════
export const CAR_BRANDS: CarMake[] = [
    // Popular in Georgia
    { brand: 'Toyota', slug: 'toyota', logo: logoUrl('toyota') },
    { brand: 'BMW', slug: 'bmw', logo: logoUrl('bmw') },
    { brand: 'Mercedes-Benz', slug: 'mercedes-benz', logo: logoUrl('mercedes-benz') },
    { brand: 'Hyundai', slug: 'hyundai', logo: logoUrl('hyundai') },
    { brand: 'Kia', slug: 'kia', logo: logoUrl('kia') },
    { brand: 'Lexus', slug: 'lexus', logo: logoUrl('lexus') },
    { brand: 'Honda', slug: 'honda', logo: logoUrl('honda') },
    { brand: 'Nissan', slug: 'nissan', logo: logoUrl('nissan') },
    { brand: 'Ford', slug: 'ford', logo: logoUrl('ford') },
    { brand: 'Volkswagen', slug: 'volkswagen', logo: logoUrl('volkswagen') },
    { brand: 'Audi', slug: 'audi', logo: logoUrl('audi') },
    { brand: 'Subaru', slug: 'subaru', logo: logoUrl('subaru') },
    { brand: 'Mazda', slug: 'mazda', logo: logoUrl('mazda') },
    { brand: 'Mitsubishi', slug: 'mitsubishi', logo: logoUrl('mitsubishi') },
    { brand: 'Chevrolet', slug: 'chevrolet', logo: logoUrl('chevrolet') },
    { brand: 'Suzuki', slug: 'suzuki', logo: logoUrl('suzuki') },
    { brand: 'Daewoo', slug: 'daewoo', logo: logoUrl('daewoo') },
    // European
    { brand: 'Porsche', slug: 'porsche', logo: logoUrl('porsche') },
    { brand: 'Volvo', slug: 'volvo', logo: logoUrl('volvo') },
    { brand: 'Land Rover', slug: 'land-rover', logo: logoUrl('land-rover') },
    { brand: 'Jaguar', slug: 'jaguar', logo: logoUrl('jaguar') },
    { brand: 'Alfa Romeo', slug: 'alfa-romeo', logo: logoUrl('alfa-romeo') },
    { brand: 'Fiat', slug: 'fiat', logo: logoUrl('fiat') },
    { brand: 'Peugeot', slug: 'peugeot', logo: logoUrl('peugeot') },
    { brand: 'Citroën', slug: 'citroen', logo: logoUrl('citroen') },
    { brand: 'Renault', slug: 'renault', logo: logoUrl('renault') },
    { brand: 'Opel', slug: 'opel', logo: logoUrl('opel') },
    { brand: 'Škoda', slug: 'skoda', logo: logoUrl('skoda') },
    { brand: 'Seat', slug: 'seat', logo: logoUrl('seat') },
    { brand: 'MINI', slug: 'mini', logo: logoUrl('mini') },
    { brand: 'Dacia', slug: 'dacia', logo: logoUrl('dacia') },
    { brand: 'Smart', slug: 'smart', logo: logoUrl('smart') },
    { brand: 'Cupra', slug: 'cupra', logo: logoUrl('cupra') },
    { brand: 'DS Automobiles', slug: 'ds-automobiles', logo: logoUrl('ds-automobiles') },
    { brand: 'Lancia', slug: 'lancia', logo: logoUrl('lancia') },
    { brand: 'Saab', slug: 'saab', logo: logoUrl('saab') },
    { brand: 'MG', slug: 'mg', logo: logoUrl('mg') },
    { brand: 'Rover', slug: 'rover', logo: logoUrl('rover') },
    // American
    { brand: 'Jeep', slug: 'jeep', logo: logoUrl('jeep') },
    { brand: 'Dodge', slug: 'dodge', logo: logoUrl('dodge') },
    { brand: 'Chrysler', slug: 'chrysler', logo: logoUrl('chrysler') },
    { brand: 'Tesla', slug: 'tesla', logo: logoUrl('tesla') },
    { brand: 'Cadillac', slug: 'cadillac', logo: logoUrl('cadillac') },
    { brand: 'Lincoln', slug: 'lincoln', logo: logoUrl('lincoln') },
    { brand: 'GMC', slug: 'gmc', logo: logoUrl('gmc') },
    { brand: 'Buick', slug: 'buick', logo: logoUrl('buick') },
    { brand: 'RAM', slug: 'ram', logo: logoUrl('ram') },
    { brand: 'Rivian', slug: 'rivian', logo: logoUrl('rivian') },
    { brand: 'Lucid', slug: 'lucid', logo: logoUrl('lucid') },
    { brand: 'Hummer', slug: 'hummer', logo: logoUrl('hummer') },
    { brand: 'Pontiac', slug: 'pontiac', logo: logoUrl('pontiac') },
    { brand: 'Oldsmobile', slug: 'oldsmobile', logo: logoUrl('oldsmobile') },
    // Premium / Exotic
    { brand: 'Maserati', slug: 'maserati', logo: logoUrl('maserati') },
    { brand: 'Ferrari', slug: 'ferrari', logo: logoUrl('ferrari') },
    { brand: 'Lamborghini', slug: 'lamborghini', logo: logoUrl('lamborghini') },
    { brand: 'Bentley', slug: 'bentley', logo: logoUrl('bentley') },
    { brand: 'Rolls-Royce', slug: 'rolls-royce', logo: logoUrl('rolls-royce') },
    { brand: 'Aston Martin', slug: 'aston-martin', logo: logoUrl('aston-martin') },
    { brand: 'McLaren', slug: 'mclaren', logo: logoUrl('mclaren') },
    { brand: 'Bugatti', slug: 'bugatti', logo: logoUrl('bugatti') },
    { brand: 'Pagani', slug: 'pagani', logo: logoUrl('pagani') },
    { brand: 'Koenigsegg', slug: 'koenigsegg', logo: logoUrl('koenigsegg') },
    { brand: 'Lotus', slug: 'lotus', logo: logoUrl('lotus') },
    { brand: 'Morgan', slug: 'morgan', logo: logoUrl('morgan') },
    // Japanese Premium
    { brand: 'Infiniti', slug: 'infiniti', logo: logoUrl('infiniti') },
    { brand: 'Acura', slug: 'acura', logo: logoUrl('acura') },
    { brand: 'Genesis', slug: 'genesis', logo: logoUrl('genesis') },
    { brand: 'Daihatsu', slug: 'daihatsu', logo: logoUrl('daihatsu') },
    { brand: 'Isuzu', slug: 'isuzu', logo: logoUrl('isuzu') },
    // Chinese
    { brand: 'BYD', slug: 'byd', logo: logoUrl('byd') },
    { brand: 'Geely', slug: 'geely', logo: logoUrl('geely') },
    { brand: 'Chery', slug: 'chery', logo: logoUrl('chery') },
    { brand: 'Haval', slug: 'haval', logo: logoUrl('haval') },
    { brand: 'Great Wall', slug: 'great-wall', logo: logoUrl('great-wall') },
    { brand: 'Lifan', slug: 'lifan', logo: logoUrl('lifan') },
    { brand: 'FAW', slug: 'faw', logo: logoUrl('faw') },
    { brand: 'Dongfeng', slug: 'dongfeng', logo: logoUrl('dongfeng') },
    // EV
    { brand: 'Polestar', slug: 'polestar', logo: logoUrl('polestar') },
    { brand: 'Fisker', slug: 'fisker', logo: logoUrl('fisker') },
    { brand: 'VinFast', slug: 'vinfast', logo: logoUrl('vinfast') },
    // Other
    { brand: 'SsangYong', slug: 'ssangyong', logo: logoUrl('ssangyong') },
    { brand: 'Lada', slug: 'lada', logo: logoUrl('lada') },
    { brand: 'UAZ', slug: 'uaz', logo: logoUrl('uaz') },
    { brand: 'Tata', slug: 'tata', logo: logoUrl('tata') },
    { brand: 'Mahindra', slug: 'mahindra', logo: logoUrl('mahindra') },
    { brand: 'Proton', slug: 'proton', logo: logoUrl('proton') },
].sort((a, b) => a.brand.localeCompare(b.brand));


// ═══════════════════════════════════════════════════════════════
// Hybrid Model Fetching
// 1. Check local detailed data first (specific models)
// 2. Fall back to NHTSA API (model classes)
// 3. User can always type custom model
// ═══════════════════════════════════════════════════════════════

const modelCache: Record<string, string[]> = {};

export async function fetchModelsForMake(brand: string): Promise<string[]> {
    if (modelCache[brand]) return modelCache[brand];

    // 1. Check local detailed data
    if (DETAILED_MODELS[brand]) {
        modelCache[brand] = DETAILED_MODELS[brand];
        return DETAILED_MODELS[brand];
    }

    // 2. Fetch from NHTSA API
    try {
        const encodedBrand = encodeURIComponent(brand);
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodedBrand}?format=json`
        );
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        const results: { Model_Name: string }[] = data.Results || [];
        const models = results
            .map(r => r.Model_Name)
            .filter(name => !/^L[PS]?\d{3,}/.test(name))
            .sort((a, b) => a.localeCompare(b));
        modelCache[brand] = models;
        return models;
    } catch {
        modelCache[brand] = [];
        return [];
    }
}

export function filterModels(models: string[], query: string): string[] {
    if (!query) return models;
    const q = query.toLowerCase();
    return models.filter(m => m.toLowerCase().includes(q));
}

// ═══════════════════════════════════════════════════════════════
// Brand Search
// ═══════════════════════════════════════════════════════════════
export function searchMakes(query: string): CarMake[] {
    if (!query) return CAR_BRANDS;
    const q = query.toLowerCase();
    return CAR_BRANDS.filter(car => car.brand.toLowerCase().includes(q));
}

export function getMakeLogo(brand: string): string | undefined {
    const car = CAR_BRANDS.find(c => c.brand === brand);
    return car?.logo;
}

export function getYearRange(): number[] {
    const currentYear = new Date().getFullYear() + 1;
    const years = [];
    for (let y = currentYear; y >= 1980; y--) years.push(y);
    return years;
}

export const CAR_COLORS = [
    { name: 'შავი', nameEn: 'Black', hex: '#000000' },
    { name: 'თეთრი', nameEn: 'White', hex: '#FFFFFF' },
    { name: 'ვერცხლისფერი', nameEn: 'Silver', hex: '#C0C0C0' },
    { name: 'რუხი', nameEn: 'Grey', hex: '#808080' },
    { name: 'წითელი', nameEn: 'Red', hex: '#DC2626' },
    { name: 'ლურჯი', nameEn: 'Blue', hex: '#2563EB' },
    { name: 'მუქი ლურჯი', nameEn: 'Dark Blue', hex: '#1E3A5F' },
    { name: 'მწვანე', nameEn: 'Green', hex: '#16A34A' },
    { name: 'ყვითელი', nameEn: 'Yellow', hex: '#EAB308' },
    { name: 'ნარინჯისფერი', nameEn: 'Orange', hex: '#EA580C' },
    { name: 'ყავისფერი', nameEn: 'Brown', hex: '#92400E' },
    { name: 'შინდისფერი', nameEn: 'Burgundy', hex: '#7F1D1D' },
    { name: 'ოქროსფერი', nameEn: 'Gold', hex: '#D4AF37' },
    { name: 'ბეჟი', nameEn: 'Beige', hex: '#D2B48C' },
];
