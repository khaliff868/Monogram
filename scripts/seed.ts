import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const schools = [
  { name: "Queen's Royal College", slug: 'queens-royal-college', location: 'Port of Spain', region: 'Port of Spain', type: 'Government', gender: 'Boys', initials: 'QRC', established: 1859, description: 'One of the oldest and most prestigious secondary schools in Trinidad and Tobago, known for academic excellence and strong traditions.', phone: '(868) 623-4157', email: 'info@qrc.edu.tt' },
  { name: 'Naparima College', slug: 'naparima-college', location: 'San Fernando', region: 'San Fernando', type: 'Denominational', gender: 'Boys', initials: 'NC', established: 1894, description: 'A prestigious Presbyterian secondary school in San Fernando known for academic achievement and sports.', phone: '(868) 652-2318', email: 'info@naparimacollege.edu.tt' },
  { name: "St. Joseph's Convent", slug: 'st-josephs-convent-pos', location: 'Port of Spain', region: 'Port of Spain', type: 'Denominational', gender: 'Girls', initials: 'SJC', established: 1836, description: 'A leading Roman Catholic girls\' secondary school in Port of Spain with a long tradition of excellence.', phone: '(868) 622-5412', email: 'info@sjcpos.edu.tt' },
  { name: "Bishop's High School", slug: 'bishops-high-school', location: 'Tobago', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'BHS', established: 1957, description: 'A co-educational government secondary school in Tobago serving the community with quality education.', phone: '(868) 639-2371', email: 'info@bishopshigh.edu.tt' },
  { name: 'Presentation College Chaguanas', slug: 'presentation-college-chaguanas', location: 'Chaguanas', region: 'Chaguanas', type: 'Denominational', gender: 'Boys', initials: 'PC', established: 1963, description: 'A Roman Catholic secondary school in Chaguanas known for its strong academic and extracurricular programs.', phone: '(868) 665-2324', email: 'info@preschag.edu.tt' },
  { name: 'Holy Name Convent', slug: 'holy-name-convent', location: 'Port of Spain', region: 'Port of Spain', type: 'Denominational', gender: 'Girls', initials: 'HNC', established: 1869, description: 'A premier Roman Catholic girls\' school in Port of Spain with a rich legacy of academic excellence.', phone: '(868) 623-6271', email: 'info@hnc.edu.tt' },
  { name: 'Fatima College', slug: 'fatima-college', location: 'Port of Spain', region: 'Port of Spain', type: 'Denominational', gender: 'Boys', initials: 'FC', established: 1945, description: 'A well-known Roman Catholic boys\' secondary school in Mucurapo, known for sports and academics.', phone: '(868) 622-6765', email: 'info@fatimacollege.edu.tt' },
  { name: "St. Augustine Girls' High School", slug: 'st-augustine-girls-high', location: 'St. Augustine', region: 'St. Augustine', type: 'Government', gender: 'Girls', initials: 'SAGHS', established: 1952, description: 'A government girls\' secondary school in St. Augustine with strong academic traditions.', phone: '(868) 645-2411', email: 'info@saghs.edu.tt' },
  { name: 'Couva East Secondary', slug: 'couva-east-secondary', location: 'Couva', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CES', description: 'A co-educational government secondary school serving the Couva community.', phone: '(868) 636-2100' },
  { name: 'Siparia Regional Secondary', slug: 'siparia-regional-secondary', location: 'Siparia', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'SRS', description: 'A regional secondary school serving the Siparia area in South Trinidad.', phone: '(868) 649-2411' },
  { name: 'Pleasantville Secondary', slug: 'pleasantville-secondary', location: 'San Fernando', region: 'San Fernando', type: 'Government', gender: 'Co-ed', initials: 'PS', description: 'A co-educational government secondary school in Pleasantville, San Fernando.', phone: '(868) 652-1200' },
  { name: 'Mucurapo East Secondary', slug: 'mucurapo-east-secondary', location: 'Port of Spain', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'MES', description: 'A co-educational government secondary school in the Mucurapo area of Port of Spain.', phone: '(868) 622-8200' },
  { name: 'Tranquility Secondary', slug: 'tranquility-secondary', location: 'Port of Spain', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'TS', description: 'A government secondary school located in the heart of Port of Spain.', phone: '(868) 623-1100' },
  { name: 'Signal Hill Secondary', slug: 'signal-hill-secondary', location: 'Tobago', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'SHS', description: 'A government secondary school in Signal Hill, Tobago.', phone: '(868) 639-3100' },
  { name: 'Arima North Secondary', slug: 'arima-north-secondary', location: 'Arima', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'ANS', description: 'A co-educational government secondary school in the northern part of Arima.', phone: '(868) 667-2100' },
  { name: 'Iere High School', slug: 'iere-high-school', location: 'Princes Town', region: 'South Trinidad', type: 'Denominational', gender: 'Co-ed', initials: 'IHS', established: 1956, description: 'A Presbyterian denominational secondary school in Princes Town serving the community.', phone: '(868) 655-2100' },
  { name: 'San Fernando Secondary', slug: 'san-fernando-secondary', location: 'San Fernando', region: 'San Fernando', type: 'Government', gender: 'Co-ed', initials: 'SFS', description: 'A co-educational government secondary school in San Fernando.', phone: '(868) 652-3100' },
  { name: 'Diego Martin North Secondary', slug: 'diego-martin-north-secondary', location: 'Diego Martin', region: 'Diego Martin', type: 'Government', gender: 'Co-ed', initials: 'DMNS', description: 'A government secondary school in Diego Martin serving the western communities.', phone: '(868) 632-2100' },
  { name: 'Chaguanas Secondary', slug: 'chaguanas-secondary', location: 'Chaguanas', region: 'Chaguanas', type: 'Government', gender: 'Co-ed', initials: 'CS', description: 'A government secondary school in Chaguanas, one of the fastest growing towns in Trinidad.', phone: '(868) 665-3100' },
  { name: 'Scarborough Secondary', slug: 'scarborough-secondary', location: 'Tobago', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'SS', description: 'A government secondary school in Scarborough, the capital of Tobago.', phone: '(868) 639-4100' },
  // --- Phase 4: 30 additional schools ---
  { name: "St. Mary's College", slug: 'st-marys-college', location: 'Port of Spain', region: 'Port of Spain', type: 'Denominational', gender: 'Boys', initials: 'CIC', established: 1863, description: 'A Roman Catholic boys\' secondary school (College of the Immaculate Conception) in Port of Spain, renowned for academics and football.', phone: '(868) 622-1965', email: 'info@stmarys.edu.tt' },
  { name: 'Trinity College Moka', slug: 'trinity-college-moka', location: 'Maraval', region: 'Port of Spain', type: 'Denominational', gender: 'Boys', initials: 'TCM', established: 1948, description: 'An Anglican boys\' secondary school in Moka, Maraval, known for academic and sporting excellence.', phone: '(868) 629-2401', email: 'info@trinitymoka.edu.tt' },
  { name: 'Hillview College', slug: 'hillview-college', location: 'Tunapuna', region: 'St. Augustine', type: 'Denominational', gender: 'Boys', initials: 'HC', established: 1959, description: 'A Presbyterian boys\' secondary school in Tunapuna with a strong record of academic achievement.', phone: '(868) 645-3134', email: 'info@hillviewcollege.edu.tt' },
  { name: 'St. Augustine Secondary', slug: 'st-augustine-secondary', location: 'St. Augustine', region: 'St. Augustine', type: 'Government', gender: 'Co-ed', initials: 'SAS', description: 'A co-educational government secondary school in St. Augustine.', phone: '(868) 645-2200' },
  { name: 'ASJA Boys\' College San Fernando', slug: 'asja-boys-san-fernando', location: 'San Fernando', region: 'San Fernando', type: 'Denominational', gender: 'Boys', initials: 'ASJA', established: 1961, description: 'An Islamic denominational boys\' secondary school run by the Anjuman Sunnat-ul-Jamaat Association.', phone: '(868) 657-2721' },
  { name: 'ASJA Girls\' College San Fernando', slug: 'asja-girls-san-fernando', location: 'San Fernando', region: 'San Fernando', type: 'Denominational', gender: 'Girls', initials: 'ASJA', established: 1960, description: 'An Islamic denominational girls\' secondary school in San Fernando.', phone: '(868) 652-2637' },
  { name: "Lakshmi Girls' Hindu College", slug: 'lakshmi-girls-hindu-college', location: 'St. Augustine', region: 'St. Augustine', type: 'Denominational', gender: 'Girls', initials: 'LGHC', established: 1953, description: 'A Hindu denominational girls\' secondary school in St. Augustine known for academic excellence.', phone: '(868) 662-4249' },
  { name: "Parvati Girls' Hindu College", slug: 'parvati-girls-hindu-college', location: 'Debe', region: 'South Trinidad', type: 'Denominational', gender: 'Girls', initials: 'PGHC', established: 1997, description: 'A Hindu denominational girls\' secondary school in Debe, South Trinidad.', phone: '(868) 647-2020' },
  { name: 'St. Charles High School', slug: 'st-charles-high-school', location: 'Tunapuna', region: 'St. Augustine', type: 'Denominational', gender: 'Girls', initials: 'SCHS', established: 1966, description: 'A Presbyterian girls\' secondary school in Tunapuna.', phone: '(868) 662-2079' },
  { name: 'Speyside Secondary', slug: 'speyside-secondary', location: 'Speyside', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'SPS', description: 'A government secondary school serving northeastern Tobago.', phone: '(868) 660-4004' },
  { name: 'Roxborough Secondary', slug: 'roxborough-secondary', location: 'Roxborough', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'RXS', description: 'A government secondary school in Roxborough, Tobago.', phone: '(868) 660-4300' },
  { name: 'Malick Secondary', slug: 'malick-secondary', location: 'Barataria', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'MSC', description: 'A co-educational government secondary school in Barataria.', phone: '(868) 674-1200' },
  { name: 'Success Laventille Secondary', slug: 'success-laventille-secondary', location: 'Laventille', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'SLS', description: 'A government secondary school serving the Laventille community.', phone: '(868) 623-5500' },
  { name: 'Barataria South Secondary', slug: 'barataria-south-secondary', location: 'Barataria', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'BSS', description: 'A co-educational government secondary school in Barataria.', phone: '(868) 638-2100' },
  { name: 'El Dorado East Secondary', slug: 'el-dorado-east-secondary', location: 'Tunapuna', region: 'St. Augustine', type: 'Government', gender: 'Co-ed', initials: 'EDES', description: 'A government secondary school in El Dorado, Tunapuna.', phone: '(868) 662-3300' },
  { name: 'El Dorado West Secondary', slug: 'el-dorado-west-secondary', location: 'Tunapuna', region: 'St. Augustine', type: 'Government', gender: 'Co-ed', initials: 'EDWS', description: 'A co-educational government secondary school in El Dorado West.', phone: '(868) 662-3400' },
  { name: 'Valencia Secondary', slug: 'valencia-secondary', location: 'Valencia', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'VS', description: 'A government secondary school serving the Valencia district.', phone: '(868) 667-5500' },
  { name: 'Toco Secondary', slug: 'toco-secondary', location: 'Toco', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'TCS', description: 'A government secondary school serving the northeastern Toco region.', phone: '(868) 670-8100' },
  { name: 'Rio Claro West Secondary', slug: 'rio-claro-west-secondary', location: 'Rio Claro', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'RCWS', description: 'A co-educational government secondary school in Rio Claro.', phone: '(868) 644-2100' },
  { name: 'Point Fortin East Secondary', slug: 'point-fortin-east-secondary', location: 'Point Fortin', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'PFES', description: 'A government secondary school in Point Fortin.', phone: '(868) 648-2300' },
  { name: 'Cedros Secondary', slug: 'cedros-secondary', location: 'Cedros', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CDS', description: 'A government secondary school serving the Cedros peninsula.', phone: '(868) 690-2100' },
  { name: 'Moruga Composite Secondary', slug: 'moruga-composite-secondary', location: 'Moruga', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'MCS', description: 'A composite government secondary school serving the Moruga community.', phone: '(868) 656-4100' },
  { name: 'Princes Town East Secondary', slug: 'princes-town-east-secondary', location: 'Princes Town', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'PTES', description: 'A co-educational government secondary school in Princes Town.', phone: '(868) 655-7100' },
  { name: 'Princes Town West Secondary', slug: 'princes-town-west-secondary', location: 'Princes Town', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'PTWS', description: 'A government secondary school in western Princes Town.', phone: '(868) 655-7200' },
  { name: 'Palo Seco Secondary', slug: 'palo-seco-secondary', location: 'Palo Seco', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'PSS', description: 'A government secondary school serving the Palo Seco area.', phone: '(868) 648-7100' },
  { name: 'Gasparillo Secondary', slug: 'gasparillo-secondary', location: 'Gasparillo', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'GSS', description: 'A co-educational government secondary school in Gasparillo.', phone: '(868) 650-2100' },
  { name: 'Marabella South Secondary', slug: 'marabella-south-secondary', location: 'Marabella', region: 'San Fernando', type: 'Government', gender: 'Co-ed', initials: 'MSS', description: 'A government secondary school in Marabella.', phone: '(868) 658-2100' },
  { name: 'Woodbrook Secondary', slug: 'woodbrook-secondary', location: 'Woodbrook', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'WSS', description: 'A co-educational government secondary school in Woodbrook, Port of Spain.', phone: '(868) 622-4100' },
  { name: 'St. James Secondary', slug: 'st-james-secondary', location: 'St. James', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'SJS', description: 'A government secondary school in St. James, Port of Spain.', phone: '(868) 622-7100' },
  { name: 'Five Rivers Secondary', slug: 'five-rivers-secondary', location: 'Arouca', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'FRS', description: 'A co-educational government secondary school in Five Rivers, Arouca.', phone: '(868) 646-2100' },
  // --- Phase 5: 50 additional schools ---
  { name: 'Presentation College San Fernando', slug: 'presentation-college-san-fernando', location: 'San Fernando', region: 'San Fernando', type: 'Denominational', gender: 'Boys', initials: 'PCSF', established: 1940, description: 'A prestigious Roman Catholic boys\' secondary school in San Fernando, the flagship Presentation Brothers school in southern Trinidad.', phone: '(868) 652-3394', email: 'info@presco.edu.tt' },
  { name: 'Naparima Girls\' High School', slug: 'naparima-girls-high-school', location: 'San Fernando', region: 'San Fernando', type: 'Denominational', gender: 'Girls', initials: 'NGHS', established: 1912, description: 'A leading Presbyterian girls\' secondary school in San Fernando known for academic excellence.', phone: '(868) 652-4591', email: 'info@napgirls.edu.tt' },
  { name: 'St. Benedict\'s College', slug: 'st-benedicts-college', location: 'La Romaine', region: 'San Fernando', type: 'Denominational', gender: 'Boys', initials: 'SBC', established: 1968, description: 'A Roman Catholic boys\' secondary school in La Romaine serving the greater San Fernando area.', phone: '(868) 657-3451' },
  { name: 'Fyzabad Anglican Secondary', slug: 'fyzabad-anglican-secondary', location: 'Fyzabad', region: 'South Trinidad', type: 'Denominational', gender: 'Co-ed', initials: 'FAS', established: 1962, description: 'An Anglican denominational secondary school in Fyzabad, the heart of Trinidad\'s oil belt.', phone: '(868) 647-2271' },
  { name: 'San Juan North Secondary', slug: 'san-juan-north-secondary', location: 'San Juan', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'SJNS', description: 'A co-educational government secondary school in San Juan, one of the most populated areas east of Port of Spain.', phone: '(868) 674-4100' },
  { name: 'Carapichaima East Secondary', slug: 'carapichaima-east-secondary', location: 'Carapichaima', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CPES', description: 'A government secondary school in Carapichaima serving central Trinidad communities.', phone: '(868) 665-5100' },
  { name: 'Carapichaima West Secondary', slug: 'carapichaima-west-secondary', location: 'Carapichaima', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CPWS', description: 'A co-educational government secondary school in western Carapichaima.', phone: '(868) 665-5200' },
  { name: 'Cunupia Secondary', slug: 'cunupia-secondary', location: 'Cunupia', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CUS', description: 'A government secondary school in Cunupia, central Trinidad.', phone: '(868) 665-6100' },
  { name: 'Tunapuna Secondary', slug: 'tunapuna-secondary', location: 'Tunapuna', region: 'St. Augustine', type: 'Government', gender: 'Co-ed', initials: 'TUS', description: 'A co-educational government secondary school in Tunapuna.', phone: '(868) 662-5100' },
  { name: 'Arima Central Secondary', slug: 'arima-central-secondary', location: 'Arima', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'ACS', description: 'A government secondary school in central Arima, the Royal Borough.', phone: '(868) 667-3100' },
  { name: 'North Eastern College', slug: 'north-eastern-college', location: 'Sangre Grande', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'NEC', established: 1963, description: 'A government secondary school in Sangre Grande serving the northeast corridor.', phone: '(868) 668-2100' },
  { name: 'Sangre Grande Secondary', slug: 'sangre-grande-secondary', location: 'Sangre Grande', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'SGS', description: 'A co-educational government secondary school in Sangre Grande.', phone: '(868) 668-3100' },
  { name: 'Chaguanas North Secondary', slug: 'chaguanas-north-secondary', location: 'Chaguanas', region: 'Chaguanas', type: 'Government', gender: 'Co-ed', initials: 'CNS', description: 'A government secondary school in northern Chaguanas.', phone: '(868) 665-7100' },
  { name: 'Debe High School', slug: 'debe-high-school', location: 'Debe', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'DHS', description: 'A co-educational government secondary school in Debe, southern Trinidad.', phone: '(868) 647-4100' },
  { name: 'Penal Secondary', slug: 'penal-secondary', location: 'Penal', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'PES', description: 'A government secondary school in Penal serving the Penal-Debe area.', phone: '(868) 647-5100' },
  { name: 'Marabella North Secondary', slug: 'marabella-north-secondary', location: 'Marabella', region: 'San Fernando', type: 'Government', gender: 'Co-ed', initials: 'MNS', description: 'A government secondary school in northern Marabella.', phone: '(868) 658-3100' },
  { name: 'Diego Martin Central Secondary', slug: 'diego-martin-central-secondary', location: 'Diego Martin', region: 'Diego Martin', type: 'Government', gender: 'Co-ed', initials: 'DMCS', description: 'A co-educational government secondary school in central Diego Martin.', phone: '(868) 632-3100' },
  { name: 'Belmont Secondary', slug: 'belmont-secondary', location: 'Belmont', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'BMS', description: 'A government secondary school in the historic Belmont community of Port of Spain.', phone: '(868) 623-8100' },
  { name: 'Morvant Laventille Secondary', slug: 'morvant-laventille-secondary', location: 'Morvant', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'MLS', description: 'A co-educational government secondary school in the Morvant-Laventille corridor.', phone: '(868) 623-9100' },
  { name: 'San Fernando West Secondary', slug: 'san-fernando-west-secondary', location: 'San Fernando', region: 'San Fernando', type: 'Government', gender: 'Co-ed', initials: 'SFWS', description: 'A government secondary school on the western side of San Fernando.', phone: '(868) 652-6100' },
  { name: 'Couva West Secondary', slug: 'couva-west-secondary', location: 'Couva', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CWS', description: 'A co-educational government secondary school in western Couva.', phone: '(868) 636-3100' },
  { name: 'Tabaquite Secondary', slug: 'tabaquite-secondary', location: 'Tabaquite', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'TBS', description: 'A government secondary school serving the rural Tabaquite community.', phone: '(868) 671-2100' },
  { name: 'Mayaro Secondary', slug: 'mayaro-secondary', location: 'Mayaro', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'MYS', description: 'A government secondary school in Mayaro on the southeastern coast of Trinidad.', phone: '(868) 630-2100' },
  { name: 'Guayaguayare Secondary', slug: 'guayaguayare-secondary', location: 'Guayaguayare', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'GGS', description: 'A government secondary school in the southeastern village of Guayaguayare.', phone: '(868) 630-4100' },
  { name: 'Point Fortin West Secondary', slug: 'point-fortin-west-secondary', location: 'Point Fortin', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'PFWS', description: 'A co-educational government secondary school in western Point Fortin.', phone: '(868) 648-3300' },
  { name: 'Bon Accord Government Secondary', slug: 'bon-accord-government-secondary', location: 'Bon Accord', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'BAGS', description: 'A government secondary school in Bon Accord, Tobago, near the airport.', phone: '(868) 639-5100' },
  { name: 'Mason Hall Secondary', slug: 'mason-hall-secondary', location: 'Mason Hall', region: 'Tobago', type: 'Government', gender: 'Co-ed', initials: 'MHS', description: 'A government secondary school in the rural Mason Hall area of Tobago.', phone: '(868) 660-5100' },
  { name: 'Hindu College Penal', slug: 'hindu-college-penal', location: 'Penal', region: 'South Trinidad', type: 'Denominational', gender: 'Boys', initials: 'HCP', established: 1956, description: 'A Hindu denominational boys\' secondary school in Penal, south Trinidad.', phone: '(868) 647-3271' },
  { name: 'St. Stephen\'s College', slug: 'st-stephens-college', location: 'Princes Town', region: 'South Trinidad', type: 'Denominational', gender: 'Boys', initials: 'SSC', established: 1960, description: 'An Anglican boys\' secondary school in Princes Town serving the southern communities.', phone: '(868) 655-2271' },
  { name: 'Shiva Boys\' Hindu College', slug: 'shiva-boys-hindu-college', location: 'Penal', region: 'South Trinidad', type: 'Denominational', gender: 'Boys', initials: 'SBHC', established: 1967, description: 'A Hindu denominational boys\' secondary school in Penal known for cricket and academics.', phone: '(868) 647-2468' },
  { name: 'ASJA Boys\' College Charlieville', slug: 'asja-boys-charlieville', location: 'Charlieville', region: 'Chaguanas', type: 'Denominational', gender: 'Boys', initials: 'ASJA', established: 1964, description: 'An Islamic denominational boys\' secondary school in Charlieville near Chaguanas.', phone: '(868) 665-4271' },
  { name: 'ASJA Girls\' College Charlieville', slug: 'asja-girls-charlieville', location: 'Charlieville', region: 'Chaguanas', type: 'Denominational', gender: 'Girls', initials: 'ASJA', established: 1968, description: 'An Islamic denominational girls\' secondary school in Charlieville.', phone: '(868) 665-4371' },
  { name: 'St. George\'s College', slug: 'st-georges-college', location: 'Barataria', region: 'Port of Spain', type: 'Denominational', gender: 'Boys', initials: 'SGC', established: 1953, description: 'A Roman Catholic boys\' secondary school in Barataria, founded by the Irish Christian Brothers.', phone: '(868) 674-3100', email: 'info@stgeorges.edu.tt' },
  { name: 'Providence Girls\' Catholic College', slug: 'providence-girls-catholic', location: 'Belmont', region: 'Port of Spain', type: 'Denominational', gender: 'Girls', initials: 'PGCC', established: 1951, description: 'A Roman Catholic girls\' secondary school in Belmont, Port of Spain.', phone: '(868) 623-4551' },
  { name: 'St. Anthony\'s College', slug: 'st-anthonys-college', location: 'Westmoorings', region: 'Diego Martin', type: 'Denominational', gender: 'Boys', initials: 'SAC', established: 1955, description: 'A Roman Catholic boys\' secondary school in Westmoorings, well known for football excellence.', phone: '(868) 632-1504', email: 'info@saintanthonys.edu.tt' },
  { name: 'Holy Faith Convent Couva', slug: 'holy-faith-convent-couva', location: 'Couva', region: 'Central Trinidad', type: 'Denominational', gender: 'Girls', initials: 'HFC', established: 1957, description: 'A Roman Catholic girls\' secondary school in Couva, central Trinidad.', phone: '(868) 636-4271' },
  { name: 'Holy Faith Convent Penal', slug: 'holy-faith-convent-penal', location: 'Penal', region: 'South Trinidad', type: 'Denominational', gender: 'Girls', initials: 'HFC', established: 1963, description: 'A Roman Catholic girls\' secondary school serving the Penal-Debe community.', phone: '(868) 647-6271' },
  { name: 'Chaguanas South Secondary', slug: 'chaguanas-south-secondary', location: 'Chaguanas', region: 'Chaguanas', type: 'Government', gender: 'Co-ed', initials: 'CSS', description: 'A co-educational government secondary school in southern Chaguanas.', phone: '(868) 665-8100' },
  { name: 'Coryal Secondary', slug: 'coryal-secondary', location: 'Coryal', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'CRS', description: 'A government secondary school in Coryal, near Sangre Grande.', phone: '(868) 668-4100' },
  { name: 'Curepe Scherzando Secondary', slug: 'curepe-scherzando-secondary', location: 'Curepe', region: 'St. Augustine', type: 'Government', gender: 'Co-ed', initials: 'CZS', description: 'A government secondary school in Curepe with a strong arts program.', phone: '(868) 662-6100' },
  { name: 'La Brea Secondary', slug: 'la-brea-secondary', location: 'La Brea', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'LBS', description: 'A government secondary school in La Brea, home of the famous Pitch Lake.', phone: '(868) 648-5100' },
  { name: 'Manzanilla Secondary', slug: 'manzanilla-secondary', location: 'Manzanilla', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'MZS', description: 'A government secondary school serving the Manzanilla coastal community.', phone: '(868) 668-6100' },
  { name: 'Piarco Secondary', slug: 'piarco-secondary', location: 'Piarco', region: 'Arima', type: 'Government', gender: 'Co-ed', initials: 'PIS', description: 'A co-educational government secondary school near Piarco International Airport.', phone: '(868) 669-2100' },
  { name: 'Port of Spain North Secondary', slug: 'port-of-spain-north-secondary', location: 'Port of Spain', region: 'Port of Spain', type: 'Government', gender: 'Co-ed', initials: 'POSN', description: 'A government secondary school in the northern section of Port of Spain.', phone: '(868) 622-9100' },
  { name: 'Caroni Secondary', slug: 'caroni-secondary', location: 'Caroni', region: 'Central Trinidad', type: 'Government', gender: 'Co-ed', initials: 'CAS', description: 'A government secondary school in the Caroni area of central Trinidad.', phone: '(868) 636-5100' },
  { name: 'Barrackpore Secondary', slug: 'barrackpore-secondary', location: 'Barrackpore', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'BPS', description: 'A co-educational government secondary school in Barrackpore, south Trinidad.', phone: '(868) 654-2100' },
  { name: 'Williamsville Secondary', slug: 'williamsville-secondary', location: 'Williamsville', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'WVS', description: 'A government secondary school serving the Williamsville community near Princes Town.', phone: '(868) 655-8100' },
  { name: 'Fyzabad Secondary', slug: 'fyzabad-secondary', location: 'Fyzabad', region: 'South Trinidad', type: 'Government', gender: 'Co-ed', initials: 'FZS', description: 'A government secondary school in Fyzabad, birthplace of the Trinidad labour movement.', phone: '(868) 647-7100' },
  { name: 'San Fernando Central Secondary', slug: 'san-fernando-central-secondary', location: 'San Fernando', region: 'San Fernando', type: 'Government', gender: 'Co-ed', initials: 'SFCS', description: 'A co-educational government secondary school in the centre of San Fernando.', phone: '(868) 652-7100' },
  { name: 'Curepe Presbyterian Secondary', slug: 'curepe-presbyterian-secondary', location: 'Curepe', region: 'St. Augustine', type: 'Denominational', gender: 'Co-ed', initials: 'CPS', established: 1965, description: 'A Presbyterian denominational secondary school in Curepe serving the St. Augustine corridor.', phone: '(868) 662-7100' },
  // --- Phase 6: Tertiary / Post-Secondary Institutions ---
  { name: 'Caribbean Fisheries Training and Development Institute', slug: 'caribbean-fisheries-training-institute', location: 'Chaguaramas', region: 'Diego Martin', type: 'Tertiary', gender: 'Co-ed', initials: 'CFTDI', description: 'A regional fisheries training institution offering programmes in fisheries management, marine operations and aquaculture.', phone: '(868) 634-4163', email: 'info@cftdi.com' },
  { name: 'Center for Workforce Development', slug: 'center-for-workforce-development', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'CWD', description: 'A workforce development centre providing skills training and professional development programmes for Trinidad and Tobago.', phone: '(868) 625-2600' },
  { name: 'Cipriani College of Labour and Co-operative Studies', slug: 'cipriani-college', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'CCLCS', established: 1966, description: 'A tertiary institution specialising in labour studies, co-operative management, and social sciences, named after Captain Arthur Andrew Cipriani.', phone: '(868) 624-5457', email: 'info@ciprianicollege.edu.tt' },
  { name: 'Cocoa Research Centre', slug: 'cocoa-research-centre', location: 'St. Augustine', region: 'St. Augustine', type: 'Tertiary', gender: 'Co-ed', initials: 'CRC', description: 'A research and training facility dedicated to cocoa cultivation, processing and development based at UWI St. Augustine.', phone: '(868) 662-2002' },
  { name: 'College of Science, Technology and Applied Arts of Trinidad and Tobago', slug: 'costaatt', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'COSTAATT', established: 2000, description: 'Trinidad and Tobago\'s premier community college offering associate degrees, diplomas and certificates in science, technology, arts and health sciences across multiple campuses.', phone: '(868) 625-5030', email: 'info@costaatt.edu.tt' },
  { name: 'Hugh Wooding Law School', slug: 'hugh-wooding-law-school', location: 'St. Augustine', region: 'St. Augustine', type: 'Tertiary', gender: 'Co-ed', initials: 'HWLS', established: 1973, description: 'The Council of Legal Education law school for Trinidad and Tobago, offering the Legal Education Certificate for admission to the Bar.', phone: '(868) 662-5860', email: 'info@hwls.edu.tt' },
  { name: 'MIC Institute of Technology', slug: 'mic-institute-of-technology', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'MIC-IT', established: 2001, description: 'Formerly Metal Industries Company, now a leading TVET institution offering technical and vocational training in engineering, welding, and industrial technology.', phone: '(868) 625-2671', email: 'info@mic.co.tt' },
  { name: 'National Energy Skills Centre', slug: 'national-energy-skills-centre', location: 'Point Fortin', region: 'South Trinidad', type: 'Tertiary', gender: 'Co-ed', initials: 'NESC', established: 2001, description: 'A state enterprise providing technical and vocational skills training for the energy and industrial sectors across multiple campuses.', phone: '(868) 648-4715', email: 'info@nesc.co.tt' },
  { name: 'St. John\'s University', slug: 'st-johns-university-tt', location: 'St. Augustine', region: 'St. Augustine', type: 'Tertiary', gender: 'Co-ed', initials: 'SJU', description: 'A private tertiary institution offering undergraduate and graduate programmes in Trinidad and Tobago.', phone: '(868) 645-0011' },
  { name: 'Trinidad and Tobago Hospitality and Tourism Institute', slug: 'tt-hospitality-tourism-institute', location: 'Chaguaramas', region: 'Diego Martin', type: 'Tertiary', gender: 'Co-ed', initials: 'TTHTI', established: 1999, description: 'The national training institution for the hospitality and tourism industry, offering diplomas and certificates in culinary arts, hotel management and tourism.', phone: '(868) 634-2074', email: 'info@tthti.edu.tt' },
  { name: 'University of Trinidad and Tobago', slug: 'university-of-trinidad-and-tobago', location: 'Arima', region: 'Arima', type: 'Tertiary', gender: 'Co-ed', initials: 'UTT', established: 2004, description: 'A national university with campuses across Trinidad specialising in engineering, applied sciences, education and biosciences.', phone: '(868) 642-8888', email: 'info@utt.edu.tt' },
  { name: 'Youth Training and Employment Partnership Programme', slug: 'ytepp', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'YTEPP', established: 1988, description: 'A government youth training programme providing vocational skills and entrepreneurship training to young people across Trinidad and Tobago.', phone: '(868) 623-4862', email: 'info@ytepp.gov.tt' },
  { name: 'Arthur Lok Jack Global School of Business', slug: 'arthur-lok-jack-gsb', location: 'Mt. Hope', region: 'St. Augustine', type: 'Tertiary', gender: 'Co-ed', initials: 'ALJGSB', established: 1989, description: 'The UWI-affiliated graduate business school offering MBA, EMBA and executive education programmes, one of the top business schools in the Caribbean.', phone: '(868) 645-6700', email: 'info@lokjackgsb.edu.tt' },
  { name: 'SBCS Global Learning Institute', slug: 'sbcs-global-learning-institute', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'SBCS', description: 'A private tertiary education provider offering professional certifications, diplomas and degree programmes in business and technology.', phone: '(868) 625-0025', email: 'info@sbcs.edu.tt' },
  { name: 'Sital College of Tertiary Education', slug: 'sital-college', location: 'San Fernando', region: 'San Fernando', type: 'Tertiary', gender: 'Co-ed', initials: 'SCTE', established: 2006, description: 'A private tertiary institution offering bachelor\'s degrees, diplomas and certificates in business, IT and social sciences.', phone: '(868) 652-0024', email: 'info@sital.edu.tt' },
  { name: 'University of the Southern Caribbean', slug: 'university-of-the-southern-caribbean', location: 'Maracas', region: 'St. Augustine', type: 'Tertiary', gender: 'Co-ed', initials: 'USC', established: 1927, description: 'A Seventh-day Adventist university offering undergraduate and graduate programmes in education, theology, business, nursing and sciences.', phone: '(868) 662-2241', email: 'info@usc.edu.tt' },
  { name: 'Caribbean Nazarene College', slug: 'caribbean-nazarene-college', location: 'Santa Cruz', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'CNC', established: 1961, description: 'A Church of the Nazarene affiliated institution offering theological and ministerial training programmes.', phone: '(868) 676-5050' },
  { name: 'CTS College of Business and Computer Science', slug: 'cts-college', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'CTS', established: 1974, description: 'A private college offering programmes in business administration, accounting, IT and computer science with campuses in Port of Spain and San Fernando.', phone: '(868) 625-4225', email: 'info@ctscollege.com' },
  { name: 'Institute of Law and Academic Studies', slug: 'institute-of-law-academic-studies', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'ILAS', description: 'A private institution offering pre-law and legal studies programmes to prepare students for Caribbean law school entry.', phone: '(868) 627-5271' },
  { name: 'School of Higher Education', slug: 'school-of-higher-education', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'SHE', description: 'A private tertiary institution providing diploma and certificate programmes in business and professional studies.', phone: '(868) 625-3100' },
  { name: 'School of Practical Accounting and Accounting Services', slug: 'school-of-practical-accounting', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'SPAAS', description: 'A specialised training institution focused on practical accounting, bookkeeping, payroll and taxation courses.', phone: '(868) 624-5100' },
  { name: 'School of Practical Management', slug: 'school-of-practical-management', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'SPM', description: 'A training institution offering practical management, supervisory skills and human resource management programmes.', phone: '(868) 624-5200' },
  { name: 'St. Andrew\'s Theological College', slug: 'st-andrews-theological-college', location: 'San Fernando', region: 'San Fernando', type: 'Tertiary', gender: 'Co-ed', initials: 'SATC', established: 1892, description: 'A Presbyterian theological college offering training for ministry, biblical studies and pastoral care.', phone: '(868) 652-2434' },
  { name: 'St. Augustine Community College', slug: 'st-augustine-community-college', location: 'St. Augustine', region: 'St. Augustine', type: 'Tertiary', gender: 'Co-ed', initials: 'SACC', description: 'A community college in St. Augustine offering associate degree and certificate programmes.', phone: '(868) 645-3500' },
  { name: 'TCHD Postgraduate Training Institute', slug: 'tchd-postgraduate-training-institute', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'TCHD', description: 'A postgraduate training institute offering specialised professional development and continuing education programmes.', phone: '(868) 622-4800' },
  { name: 'Trinidad and Tobago Bible College', slug: 'trinidad-tobago-bible-college', location: 'Port of Spain', region: 'Port of Spain', type: 'Tertiary', gender: 'Co-ed', initials: 'TTBC', description: 'A Bible college offering theological education, pastoral training and Christian ministry programmes.', phone: '(868) 622-5800' },
  { name: 'Trinizuela Technical and Vocational College', slug: 'trinizuela-technical-vocational-college', location: 'Chaguanas', region: 'Chaguanas', type: 'Tertiary', gender: 'Co-ed', initials: 'TTVC', description: 'A technical and vocational college offering hands-on training in trades, technology and industrial skills.', phone: '(868) 665-9100' },
];


async function main() {
  console.log('Seeding database...');

  // Hidden test account
  const testPw = await bcrypt.hash('p$GfcOcx15', 12);
  await prisma.user.upsert({
    where: { email: 'abacus-5b25ddca@example.com' },
    update: {},
    create: { email: 'abacus-5b25ddca@example.com', username: 'testadmin', password: testPw, role: 'admin' },
  });

  // Admin account
  const adminPw = await bcrypt.hash('Safemars$$2436', 12);
  await prisma.user.upsert({
    where: { email: 'khaliff@email.com' },
    update: {},
    create: { email: 'khaliff@email.com', username: 'khaliff', password: adminPw, role: 'admin' },
  });

  // Schools
  for (const school of schools) {
    await prisma.school.upsert({
      where: { slug: school.slug },
      update: {},
      create: school,
    });
  }

  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });

  // Mark some schools as featured/verified
  await prisma.school.updateMany({
    where: { slug: { in: ['queens-royal-college', 'naparima-college', 'st-josephs-convent-pos', 'fatima-college'] } },
    data: { featured: true, verified: true },
  });
  await prisma.school.updateMany({
    where: { slug: { in: ['holy-name-convent', 'presentation-college-chaguanas'] } },
    data: { verified: true },
  });
  await prisma.school.updateMany({
    where: { slug: { in: ['st-marys-college', 'hillview-college'] } },
    data: { featured: true, verified: true },
  });
  await prisma.school.updateMany({
    where: { slug: { in: ['trinity-college-moka', 'lakshmi-girls-hindu-college', 'st-augustine-girls-high'] } },
    data: { verified: true },
  });
  // Phase 5 featured/verified
  await prisma.school.updateMany({
    where: { slug: { in: ['presentation-college-san-fernando', 'naparima-girls-high-school', 'st-anthonys-college', 'st-georges-college'] } },
    data: { featured: true, verified: true },
  });
  await prisma.school.updateMany({
    where: { slug: { in: ['st-benedicts-college', 'shiva-boys-hindu-college', 'holy-faith-convent-couva', 'providence-girls-catholic'] } },
    data: { verified: true },
  });

  // Sample announcement
  const annCount = await prisma.announcement.count();
  if (annCount === 0) {
    await prisma.announcement.create({
      data: {
        text: 'Welcome to MONOGRAM! Trinidad & Tobago\'s premier school directory is now live.',
        active: true,
      },
    });
  }

  // Sample listings
  const qrc = await prisma.school.findUnique({ where: { slug: 'queens-royal-college' } });
  const nap = await prisma.school.findUnique({ where: { slug: 'naparima-college' } });
  const admin = await prisma.user.findUnique({ where: { email: 'khaliff@email.com' } });

  if (qrc && admin) {
    const listingCount = await prisma.listing.count();
    if (listingCount === 0) {
      await prisma.listing.createMany({
        data: [
          { title: 'Mathematics Textbook Form 3', description: 'Nelson Mathematics for Caribbean Schools. Good condition, some highlighting.', category: 'BOOKS', condition: 'Used', price: 75, contactWhatsApp: '18681234567', contactPhone: '(868) 123-4567', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { title: 'English Literature - A World of Poetry', description: 'CSEC Poetry anthology, perfect condition.', category: 'BOOKS', condition: 'Like New', price: 60, contactEmail: 'seller@example.com', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { title: 'QRC School Shirt Size M', description: 'White uniform shirt, worn once. Size Medium.', category: 'UNIFORMS', condition: 'Like New', price: 45, contactWhatsApp: '18689876543', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { title: 'School Shoes Size 9', description: 'Black leather school shoes, barely worn.', category: 'SHOES', condition: 'Like New', price: 120, contactPhone: '(868) 555-0123', schoolId: qrc.id, userId: admin.id, status: 'approved' },
        ],
      });
    }

    if (nap) {
      const napListingCount = await prisma.listing.count({ where: { schoolId: nap.id } });
      if (napListingCount === 0) {
        await prisma.listing.createMany({
          data: [
            { title: 'Biology Textbook CSEC', description: 'Comprehensive biology for CSEC level.', category: 'BOOKS', condition: 'Used', price: 55, contactWhatsApp: '18681112222', schoolId: nap.id, userId: admin.id, status: 'approved' },
            { title: 'Naparima College Uniform Set', description: 'Complete uniform set: shirt, pants, tie.', category: 'UNIFORMS', condition: 'New', price: 200, contactPhone: '(868) 333-4444', schoolId: nap.id, userId: admin.id, status: 'approved' },
          ],
        });
      }
    }
  }

  // Sample past papers
  if (qrc && admin) {
    const paperCount = await prisma.pastPaper.count();
    if (paperCount === 0) {
      await prisma.pastPaper.createMany({
        data: [
          { subject: 'Mathematics', examType: 'CSEC', year: 2024, paperNum: 'Paper 1', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'Mathematics', examType: 'CSEC', year: 2024, paperNum: 'Paper 2', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'Mathematics', examType: 'CSEC', year: 2023, paperNum: 'Paper 1', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'English Language', examType: 'CSEC', year: 2024, paperNum: 'Paper 1', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'English Language', examType: 'CSEC', year: 2024, paperNum: 'Paper 2', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'Physics', examType: 'CAPE', year: 2024, paperNum: 'Unit 1 Paper 1', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'Physics', examType: 'CAPE', year: 2024, paperNum: 'Unit 1 Paper 2', schoolId: qrc.id, userId: admin.id, status: 'approved' },
          { subject: 'Chemistry', examType: 'CSEC', year: 2023, paperNum: 'Paper 1', schoolId: qrc.id, userId: admin.id, status: 'approved' },
        ],
      });
    }
  }

  // Sample suppliers
  if (qrc && nap && admin) {
    const supplierCount = await prisma.supplier.count();
    if (supplierCount === 0) {
      const s1 = await prisma.supplier.create({
        data: {
          businessName: 'Island Bookshop',
          description: 'Full range of CSEC and CAPE textbooks, school stationery, and supplies.',
          categories: ['BOOKS', 'SUPPLIES'],
          location: 'Port of Spain',
          phone: '(868) 625-1234',
          email: 'info@islandbookshop.tt',
          whatsApp: '18686251234',
          website: 'https://islandbookshop.tt',
          verified: true,
          userId: admin.id,
          status: 'approved',
        },
      });
      await prisma.supplierSchool.createMany({
        data: [
          { supplierId: s1.id, schoolId: qrc.id },
          { supplierId: s1.id, schoolId: nap.id },
        ],
      });

      const s2 = await prisma.supplier.create({
        data: {
          businessName: 'T&T Uniform Centre',
          description: 'Official uniforms for schools across Trinidad and Tobago. Custom sizing available.',
          categories: ['UNIFORMS', 'SHOES'],
          location: 'San Fernando',
          phone: '(868) 652-5678',
          whatsApp: '18686525678',
          verified: true,
          userId: admin.id,
          status: 'approved',
        },
      });
      await prisma.supplierSchool.createMany({
        data: [
          { supplierId: s2.id, schoolId: qrc.id },
          { supplierId: s2.id, schoolId: nap.id },
        ],
      });

      const s3 = await prisma.supplier.create({
        data: {
          businessName: 'Footwear Plus',
          description: 'Quality school shoes at affordable prices.',
          categories: ['SHOES'],
          location: 'Chaguanas',
          phone: '(868) 665-9999',
          whatsApp: '18686659999',
          userId: admin.id,
          status: 'approved',
        },
      });
      await prisma.supplierSchool.create({ data: { supplierId: s3.id, schoolId: qrc.id } });
    }
  }

  // Sample sponsored homepage banner ad
  const existingAd = await prisma.advertisement.findFirst({ where: { advertiserName: 'Scholars Depot' } });
  if (!existingAd) {
    await prisma.advertisement.create({
      data: {
        advertiserName: 'Scholars Depot',
        bannerImagePath: 'https://cdn.abacus.ai/images/4e9cda86-5b06-4910-a949-29956b90eaea.png',
        isPublicImage: true,
        destinationUrl: 'https://monogram.tt',
        active: true,
        showOnAll: true,
      },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
