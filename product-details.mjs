// Product-specific vector silhouettes, designed for the existing 100 × 100 canvas.
const path=(d,fill,stroke='',w=2)=>`<path d="${d}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`;
const rect=(x,y,w,h,c,r=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
const ellipse=(x,y,rx,ry,c)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const text=(s,x=50,y=59,width=32,size=7,c='#36564a')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="${Math.min(size,width/Math.max(1,s.length*.65)).toFixed(2)}" fill="${c}">${s}</text>`;
const plate=ellipse(50,70,41,17,'#bccfc5')+ellipse(50,66,37,15,'#fbf6e8');
const leaf=path('M47 27Q59 5 77 15Q69 30 47 27','#709664');
const shine=path('M33 34V64','none','#ffffff66',4);
const grain=(c='#e6c98d')=>[0,1,2,3,4,5].map(i=>ellipse(35+i%3*15,45+Math.floor(i/3)*13,6,4,c)).join('');
function tag(a,b='',w=36,y=51){return rect(50-w/2-3,y-9,w+6,b?25:17,'#fcf7e6',3)+text(a,50,y+1,w,7)+ (b?text(b,50,y+10,w,5,'#71836b'):'')}
function bag(a,c='#9fbca7',motif='',b=''){return path('M23 16H77L73 27L77 83H23L27 27Z',c)+path('M24 17H76M24 80H76','none','#ffffff55',4)+rect(29,30,42,43,'#faf4e3')+text(a,50,41,36,7)+motif+(b?text(b,50,72,35,4.7):'')+shine}
function bottle(a,c='#94bcb4',cap='#4b796f',extra=''){return path('M39 19H61V29L70 40V80Q50 88 30 80V40L39 29Z',c)+rect(38,11,24,12,cap,3)+tag(a,'KEDAI KITA',29,52)+shine+extra}
function tube(a,c='#bcb0ce'){return path('M29 18H71L64 75H36Z',c)+rect(36,75,28,9,'#637e72',2)+path('M31 21H69','none','#ffffff88',3)+tag(a,'PENJAGAAN',24,48)}
function jar(a,c,shape=''){return rect(28,28,44,54,c,8)+rect(27,20,46,12,'#779684',3)+tag(a,'',32,55)+shape+shine}
function tin(a,c){return rect(29,21,42,61,c,5)+ellipse(50,21,21,5,'#d9e0d7')+ellipse(50,21,10,2,'#a6bab0')+tag(a,'',32,53)+shine}
function glove(c){return path('M32 79L22 49Q21 42 27 44L34 53L30 25Q30 17 36 22L41 45V17Q43 10 47 18L50 43L53 18Q58 12 60 21L58 47L65 29Q71 24 71 34L66 65L60 82Z',c)+rect(30,76,33,10,'#527967',2)}
function scissors(c='#839ab3'){return path('M32 75L66 16M68 75L34 16','none','#b3c5c0',7)+ellipse(31,75,12,10,c)+ellipse(69,75,12,10,c)+ellipse(31,75,6,5,'#f7f4e8')+ellipse(69,75,6,5,'#f7f4e8')+ellipse(50,47,4,4,'#697d79')}
function roll(c='#b8bcb3'){return ellipse(50,48,31,25,c)+rect(19,47,62,16,c,0)+ellipse(50,62,31,22,c)+ellipse(50,46,16,12,'#f9f2df')+ellipse(50,46,11,8,'#71887d')}
function frozen(a,food){return rect(16,17,68,65,'#a5cbd2',7)+rect(21,26,58,49,'#dfedf0',4)+text(a,50,38,50,7)+food+path('M24 20H76M24 80H76','none','#6c9eaf',2)}
export function detailedProductArt(id){
 const fruits={
 pineapple:path('M35 36L24 7L45 27L49 4L59 29L78 13L67 39','#71965b')+ellipse(50,60,25,29,'#dcb65b')+path('M31 42L67 79M27 56L56 86M41 34L74 66M67 41L32 79M73 54L45 87M56 34L27 65','none','#b99443',2),
 papaya:ellipse(50,51,26,38,'#dcb358')+ellipse(51,51,20,32,'#ef9961')+ellipse(51,51,10,23,'#ffd38c')+Array.from({length:13},(_,i)=>ellipse(47+i%3*4,34+Math.floor(i/3)*8,2,3,'#5c5140')).join(''),
 mango:path('M39 23Q65 9 78 40Q83 65 59 82Q35 97 24 69Q13 42 39 23','#e8ba58')+leaf+path('M32 42Q26 61 39 73','none','#fbe5a2',5),
 spinach:[-23,0,23].map((v,i)=>`<g transform="rotate(${v} 50 80)">${path('M50 85V31','none','#91ac62',4)+ellipse(50,37,14,25,i%2?'#7d9f62':'#5d8f63')+path('M50 65V23M50 48L40 39M50 39L60 29','none','#adc487',2)}</g>`).join('')
 };if(fruits[id])return fruits[id];
 const exact={
 yogurt:ellipse(50,26,26,7,'#c6b3d0')+path('M24 27H76L67 81H33Z','#e9e6e0')+tag('YOGURT','ASLI',32,53),
 chocolate:rect(25,15,50,68,'#9b6e57',3)+[0,1,2,3,4,5].map(i=>rect(30+i%2*21,21+Math.floor(i/2)*18,18,15,'#624638',2)).join('')+path('M24 56L49 66L76 56V85H24Z','#d8b9a1')+text('COKLAT',50,78,40,7),
 cheese:rect(20,26,60,54,'#b9d2c2')+rect(26,33,48,40,'#f1cf6d')+ellipse(36,44,4,4,'#d5af4e')+ellipse(64,60,5,5,'#d5af4e')+tag('KEJU','KEPING',30,54),
 popcorn:path('M26 43H74L68 85H32Z','#f2d1b3')+[0,1,2].map(i=>path(`M${34+i*13} 46L${37+i*11} 81`,'none','#c77963',6)).join('')+[[31,41],[44,36],[56,38],[69,41],[50,25]].map(([x,y])=>ellipse(x,y,11,10,'#f7e6b9')).join(''),
 dishsponge:rect(20,31,61,44,'#ddbf5a',9)+rect(20,31,61,13,'#608977',6)+path('M28 57H32M46 62H50M66 54H70','none','#b8993e',3),
 trashbags:roll('#4f6860')+path('M76 45L89 81H67L63 57','#8b9f8c'),
 brush:rect(45,13,9,51,'#9db4a7',4)+ellipse(50,67,18,21,'#d8dfd0')+path('M36 57V76M44 51V82M53 49V85M62 55V78','none','#90a99b',3),
 extension:rect(13,34,74,34,'#dbe1d7',7)+[29,50,71].map(x=>ellipse(x,51,9,11,'#b6c4b9')+path(`M${x} 44V47M${x-4} 53V56M${x+4} 53V56`,'none','#4a655b',2)).join('')+path('M13 50Q1 49 6 25H17','none','#78958a',3),
 deskclock:rect(13,27,74,50,'#5c7e73',9)+rect(19,34,62,33,'#d8e5ce',4)+text('08:00',50,57,52,16)+rect(22,77,9,5,'#405f53',2)+rect(69,77,9,5,'#405f53',2),
 bulbsmart:ellipse(50,37,25,26,'#f2deb1')+path('M31 51L38 68H62L69 51','#ead5a7')+rect(38,67,24,16,'#9aafab',2)+path('M39 72H61M39 78H61','none','#6b8780',2)+path('M40 30Q50 20 60 30M45 36Q50 31 55 36','none','#9abbb4',3),
 bagel:ellipse(50,51,34,27,'#c68f53')+ellipse(50,47,31,24,'#dfb77e')+ellipse(50,47,11,9,'#fbf7e9')+path('M29 38L32 40M61 32L64 35M34 58L36 62M70 51L73 54M48 28V31','none','#f6e3b6',2),
 buns:plate+ellipse(35,53,20,17,'#dfb274')+ellipse(65,53,20,17,'#e9c183')+path('M28 41L36 61M58 41L66 61','none','#fcdf9f',4),
 donut:ellipse(50,53,33,28,'#c98f56')+ellipse(50,48,32,25,'#ead3ac')+ellipse(50,48,11,9,'#f9f5e8')+path('M27 40H30M63 34H66M39 66H42M69 54H72','none','#fff9eb',2),
 waffle:rect(20,25,60,55,'#cf9a54',8)+[0,1,2].map(i=>[0,1,2].map(j=>rect(27+i*17,32+j*14,11,9,'#a9743e',2)).join('')).join('')+path('M25 31L72 70M38 26L77 52','none','#604633',4),
 pancake:plate+[0,1,2].map(i=>ellipse(50,63-i*9,30,10,i%2?'#c5975b':'#e2ba7a')).join('')+rect(42,34,17,11,'#f4d578',2)+path('M34 43Q37 61 45 52T62 47','none','#ae7950',5),
 tart:plate+path('M23 51L30 72H69L78 51','#c89453')+ellipse(50,50,28,18,'#d8ad6d')+ellipse(50,48,22,13,'#f3d77b'),
 pacifier:ellipse(50,50,29,18,'#c9b2c6')+path('M41 49V28Q50 13 59 28V49','#e7d6b8')+ellipse(50,68,15,14,'#b694b7')+ellipse(50,68,10,9,'#f9f6e8'),
 bib:path('M29 16H41Q50 43 59 16H71V55Q79 86 50 86Q21 86 29 55Z','#e3b7b9')+path('M31 62Q50 72 69 62V76H31Z','#f0d2c4')+ellipse(50,50,8,8,'#f8e1ae'),
 pettoy:path('M26 39Q11 23 14 42Q1 56 25 58L72 58Q94 73 88 53Q99 35 73 39Z','#cbab78'),
 petbowl:ellipse(50,42,32,12,'#9fbbb1')+path('M18 42H82L89 73Q50 87 11 73Z','#a8c2ba')+ellipse(50,42,25,8,'#536b5d')+ellipse(50,70,7,6,'#eff0dc'),
 petbrush:rect(45,54,10,33,'#aa9270',4)+rect(25,18,50,43,'#c9ae88',12)+[0,1,2,3].map(i=>path(`M32 ${28+i*8}H68`,'none','#7b7667',3)).join(''),
 petpad:rect(17,20,65,63,'#b5ccd1',3)+rect(24,27,51,49,'#edf1e6',2)+path('M29 37H71M29 49H71M29 61H71M38 30V73M51 30V73M64 30V73','none','#d5dfd8',1),
 eraser:path('M21 38L40 23H78V63L59 78H21Z','#d7a7ac')+path('M21 38H59L78 23V63L59 78V38','#c28c94')+rect(33,38,26,40,'#e9dfce',0)+text('KITA',46,60,22,6),
 ruler:`<g transform="rotate(-32 50 50)">${rect(11,39,78,23,'#dfbd78',2)+Array.from({length:14},(_,i)=>path(`M${16+i*5} 40V${i%2?46:51}`,'none','#8e774e',1)).join('')+text('30 cm',51,58,31,5)}</g>`,
 folder:rect(14,31,72,50,'#c4af7f',4)+path('M14 31V22H42L49 31','#c4af7f')+path('M18 40H89L80 82H14Z','#e5cd94')+tag('DOKUMEN','',40,61),
 scissors:scissors(),pruner:scissors('#738f70'),
 wateringcan:rect(20,38,43,40,'#8baaaa',8)+path('M60 52L85 31L91 36L63 71','#8baaaa')+path('M22 49Q-2 40 13 28Q23 23 28 38','none','#648a85',6)+ellipse(88,32,7,4,'#507c75'),
 sprayer:bottle('TANAMAN','#bad3b0','#6f927c',path('M40 12V5H73L78 15H58V23','none','#658c76',5)),
 bandage:roll('#dcc8a6')+path('M23 61Q18 80 54 86H81V73H49Z','#e6d9bc'),
 cotton:rect(23,19,54,65,'#b4d2cd',7)+rect(28,25,44,54,'#e7efdf',4)+[0,1,2].map(i=>ellipse(50,38+i*14,17,8,'#fffdf1')).join(''),
 firstaid:rect(16,29,68,52,'#ebebe0',7)+path('M35 29V18H65V29','none','#829d91',6)+path('M44 41H56V51H66V63H56V73H44V63H34V51H44Z','#ad695b'),
 toothbrush:rect(45,30,10,56,'#8dafb7',5)+rect(42,13,16,26,'#c1d8d4',5)+path('M43 19H57M43 25H57M43 31H57','none','#fff9e9',2),
 dentalfloss:rect(25,28,50,53,'#a9c7bd',12)+path('M30 35Q50 23 70 35','none','#759e90',3)+tag('FLOS','GIGI',31,56),
 icepack:rect(19,23,62,58,'#bddbe3',8)+path('M50 34V67M35 42L65 59M35 59L65 42','none','#f6fbf5',3),
 razor:rect(45,34,10,52,'#80a7a2',5)+rect(26,16,48,19,'#6d8586',5)+path('M32 21H68M32 27H68','none','#e3e9e1',2),
 comb:rect(23,17,12,67,'#b7a1b9',5)+Array.from({length:11},(_,i)=>rect(31,20+i*5,39,3,'#b7a1b9',1)).join(''),
 deodorant:rect(34,28,32,56,'#b5cbb9',10)+ellipse(50,28,16,17,'#dfdbd5')+tag('ROLL-ON','',23,58),
 lipbalm:rect(39,38,22,45,'#b89bad',3)+rect(41,19,18,24,'#e6b5a5',7)+rect(67,37,18,45,'#cdb3c2',4),
 batteryaa:[0,1,2,3].map(i=>rect(13+i*19,23,16,58,'#7c9290',3)+rect(13+i*19,23,16,18,'#ceb075',3)+rect(18+i*19,19,6,5,'#cbd4cb',1)+text('AA',21+i*19,60,11,6)).join(''),
 torch:path('M32 18H68L63 42H58V84H42V42H37Z','#4f6e67')+ellipse(50,19,18,7,'#d9c993')+rect(46,49,8,12,'#b8cbba',2),
 measuringtape:rect(20,29,55,48,'#d1ad63',15)+ellipse(48,51,16,16,'#6e8177')+text('5 m',48,55,22,10,'#fff6dd')+path('M73 65H88V59','none','#9cae9e',7),
 screwdriver:[-20,20].map(x=>`<g transform="translate(${x} 0)">${path('M50 12V52','none','#a6b5ae',6)+rect(39,49,22,35,'#ba8b62',7)+path('M45 57V77M55 57V77','none','#efd6a6',2)}</g>`).join(''),
 padlock:path('M31 42V27Q50 0 69 27V42','none','#93a8a0',8)+rect(23,37,54,44,'#d0ac65',6)+ellipse(50,55,5,5,'#7c704d')+path('M50 58V68','none','#7c704d',4),
 rope:Array.from({length:5},(_,i)=>`<ellipse cx="50" cy="${31+i*9}" rx="29" ry="14" fill="none" stroke="#c6ad80" stroke-width="6"/>`).join('')+path('M78 65Q94 88 68 85','none','#c6ad80',6),
 hookset:[25,50,75].map(x=>rect(x-9,23,18,22,'#dce3d7',4)+path(`M${x} 37V61Q${x+12} 75 ${x+12} 56`,'none','#8ea39b',4)).join(''),
 pliers:path('M32 18L39 42L61 82M68 18L61 42L39 82','none','#96a9a5',8)+path('M44 58L33 82M56 58L67 82','none','#bd8765',10)+ellipse(50,46,5,5,'#627d71'),
 usbcable:path('M28 33V62Q28 90 51 80Q76 70 58 53Q42 42 58 30H72','none','#789a9b',5)+rect(19,14,18,22,'#a5bebe',4)+rect(22,10,12,6,'#bbc7c0',1)+rect(69,21,17,17,'#a5bebe',4)+rect(85,25,5,9,'#bbc7c0',1),
 wallcharger:rect(29,32,42,44,'#d7dfd3',9)+path('M39 32V17M61 32V17','none','#9bb0a2',5)+rect(40,61,20,6,'#527766',2),
 earphones:path('M32 29V58Q32 71 49 68Q67 71 67 58V29M50 69V87','none','#729796',3)+rect(24,15,16,21,'#a8c6c5',8)+rect(59,15,16,21,'#a8c6c5',8)+rect(34,27,7,15,'#a8c6c5',3)+rect(59,27,7,15,'#a8c6c5',3),
 powerbank:rect(27,16,46,70,'#90acac',8)+rect(33,23,34,49,'#b9ceca',5)+path('M52 34L43 48H52L47 61L60 43H51Z','#edf2db')+text('10000 mAh',50,79,34,5),
 phoneholder:rect(29,15,42,54,'#607c75',7)+rect(34,21,32,38,'#bdd8cd',3)+path('M46 69V79H26V85H75V79H55V69','#9bb8ab'),
 mouse:path('M24 45Q24 14 50 14Q76 14 76 45V65Q76 87 50 87Q24 87 24 65Z','#aac3bf')+path('M50 17V47M26 47H74','none','#759992',2)+rect(46,26,8,14,'#4e7a70',4),
 keyboard:rect(7,27,86,50,'#a8bdb7',6)+Array.from({length:30},(_,i)=>rect(13+i%10*7.5,34+Math.floor(i/10)*10,5.5,7,'#e3e9da',1)).join('')+rect(31,65,38,6,'#e3e9da',1),
 memorycard:path('M29 15H63L73 27V85H29Z','#627c78')+rect(36,23,27,14,'#d0b16d',1)+tag('32 GB','',29,62),
 socks:[-13,16].map(x=>`<g transform="translate(${x} 0)">${path('M41 18H65V60L46 80Q27 86 26 73L41 52Z','#b1bba8')+path('M42 25H63M42 32H63','none','#ece8d9',3)}</g>`).join(''),
 tshirt:path('M17 29L38 16Q50 30 62 16L83 29L73 50L63 44V83H37V44L27 50Z','#9daf9c')+path('M40 18Q50 30 60 18','none','#d7dfcb',4),
 tote:path('M32 35V22Q50 5 68 22V35','none','#927e5f',5)+path('M20 33H80L74 84H26Z','#dfcda8')+text('kita.',50,62,40,14),
 cap:path('M21 57Q19 17 55 20Q82 20 80 57Z','#92aaa2')+path('M21 57Q39 42 80 57L94 68Q68 83 21 66Z','#668d7e')+path('M53 24V51','none','#d4e0cb',2),
 towel:rect(21,22,58,59,'#b6c3b2',7)+path('M25 68H75M25 73H75','none','#eef0dd',3)+path('M29 79V86M39 79V86M49 79V86M59 79V86M69 79V86','none','#91a18b',2),
 umbrella:path('M50 16Q17 16 10 51Q23 42 36 52Q50 43 64 52Q78 42 90 51Q83 16 50 16Z','#9bb6a4')+path('M50 15V79Q50 93 63 81M50 18Q34 29 36 49M50 18Q66 29 64 49','none','#567d68',3),
 raincoat:path('M36 27Q35 7 50 7Q65 7 64 27L83 37L75 60L66 52L72 85H28L34 52L25 60L17 37Z','#d6b570')+path('M50 28V83M35 62H43M57 62H65','none','#ad8a50',2)+ellipse(50,20,7,9,'#eae1bc'),
 apron:path('M38 25V14H62V25L66 46L77 84H23L34 46Z','#c4b18b')+path('M42 24V19H58V24','none','#f0e5cb',4)+rect(38,55,24,19,'#8d9d7f',2),
 slippers:[-20,20].map(x=>`<g transform="translate(${x} 0) rotate(10 50 50)">${ellipse(50,50,16,35,'#8eaba0')+path('M36 41L50 32L64 41M50 32V57','none','#d1dcca',5)}</g>`).join('')
 };
 const aliases={lightningcable:'usbcable',glovesgarden:'gloveswork',ducttape:'tape',handtowel:'towel',wetwipes:'facialtissue'};
 if(id==='lightningcable')return exact.usbcable.replace(rect(85,25,5,9,'#bbc7c0',1),rect(85,26,7,7,'#d8cda8',1)+path('M87 27V32M90 27V32','none','#987d50',.7));
 if(exact[id])return exact[id];if(aliases[id]&&exact[aliases[id]])return exact[aliases[id]];
 if(['gloveswork','glovesgarden'].includes(id))return glove(id==='gloveswork'?'#b8a98c':'#9bb6a0');
 if(['tape','ducttape'].includes(id))return roll(id==='tape'?'#e6d6b1':'#8f9d98');
 if(['highlighter','markers'].includes(id))return ['#dab774','#a1b5cc','#a3ba8b'].map((c,i)=>rect(19+i*24,30,17,51,c,3)+rect(19+i*24,14,17,25,c,3)+path(`M${21+i*24} 37H${34+i*24}`,'none','#f2f0db',3)).join('');
 if(['facialtissue','wetwipes','screenwipe'].includes(id))return rect(17,34,67,43,'#b3c9bf',7)+path('M35 37L31 15L47 20L61 14L67 36Z','#fcf9ec')+tag(id==='screenwipe'?'LAP SKRIN':id==='wetwipes'?'TISU BASAH':'TISU MUKA','',43,59);
 const food={chips:['KENTANG','#d1ac64',grain()],cracker:['KEROPOK','#adbfa2',grain('#e9d8ab')],cereal:['BIJIRIN','#d6bc7f',grain()],babycereal:['BIJIRIN BAYI','#dfb9b7',grain()],treatscat:['SNEK KUCING','#c4ab81',grain('#a08b62')],treatsdog:['SNEK ANJING','#b7a17d',grain('#a08b62')],cornflour:['TEPUNG JAGUNG','#dacd9a',grain('#f5edcf')],vermicelli:['BIHUN BERAS','#b9cbb8',path('M33 50Q40 42 47 54T66 54M33 59Q42 50 50 61T66 60','none','#e2d4af',3)],chickenstock:['PATI AYAM','#dbbc72',rect(33,48,15,14,'#b39454')+rect(51,52,16,14,'#bf9d5a')],mulch:['SUNGKUPAN','#b6a07e',grain('#8b7254')],herbseeds:['DAUN SUP','#a9c29b',leaf]};
 if(food[id])return bag(...food[id]);
 const liquids={bleach:['PELUNTUR','#e0e3d1'],floorcleaner:['LANTAI','#b5c8ad'],softener:['PELEMBUT','#c9b6ce'],babyshampoo:['SYAMPU BAYI','#dbc9ad'],babylotion:['LOSYEN BAYI','#d8c4ce'],babysoap:['MANDIAN BAYI','#b7ced2'],bodywash:['MANDIAN','#c5b5ce'],conditioner:['PERAPI','#bed1af'],mouthwash:['MULUT','#a1c6c8'],tehbotol:['TEH AIS','#bc9b6d'],isotonik:['ISOTONIK','#bcd5d8'],sirap:['KORDIAL ROS','#c78d8c'],greentea:['TEH HIJAU','#b2c499'],minumanyogurt:['YOGURT','#e5dec7'],chilisauce:['SOS CILI','#bc745f'],tomatosauce:['SOS TOMATO','#c9836b'],vinegar:['CUKA','#d3d9b9']};
 if(liquids[id])return bottle(...liquids[id]);
 const tubes={facewash:'PENCUCI MUKA',sunscreen:'PELINDUNG UV',handcream:'KRIM TANGAN'};if(tubes[id])return tube(tubes[id]);
 if(id==='honeypot')return jar('MADU','#d7af5c',path('M38 67L50 61L62 67L50 74Z','#bb9043'));
 if(id==='peanutbutter')return jar('MENTEGA KACANG','#c6a17a');if(id==='pepper')return jar('LADA HITAM','#b5a18d');
 const cans={kopitin:['KOPI SUSU','#bc9c7c'],lemonade:['LEMON','#d5ca77'],airgas:['SODA','#abc5c9'],beans:['KACANG','#c58b72']};if(cans[id])return tin(...cans[id]);
 const cartons={airkelapa:['AIR KELAPA','#a9bd98'],susucrunch:['SUSU COKLAT','#b0937b'],jusepal:['JUS EPAL','#aebd81'],soya:['SOYA','#dbcd9d'],coconutmilk:['SANTAN','#b9cbb5']};if(cartons[id]){const [a,c]=cartons[id];return path('M27 29L39 14H72V83H27Z',c)+path('M39 14L49 29H27M49 29H72','none','#f3eddb',2)+tag(a,'',35,53)+shine}
 const foods={fries:['KENTANG',[0,1,2,3,4].map(i=>rect(29+i*9,46+i%2*5,6,23,'#d6b461',2)).join('')],fishball:['BEBOLA IKAN',grain('#f3ead6')],meatballs:['BEBOLA DAGING',grain('#a18161')],springroll:['POPIA',[0,1,2].map(i=>rect(29+i*15,46,11,25,'#dfba7f',5)).join('')],pizza:['PIZA MINI',ellipse(50,59,22,13,'#d5b36d')+ellipse(50,58,18,10,'#c78363')+grain('#e9c77b')],burgerpatty:['DAGING BURGER',ellipse(50,60,23,11,'#93715c')+path('M33 55L61 65M39 51L69 61','none','#644e40',2)],frozenveggies:['SAYUR CAMPUR',grain('#92b17a')+rect(32,59,7,7,'#dda465')+rect(61,49,7,7,'#dda465')]};if(foods[id])return frozen(...foods[id]);
 if(['bihun','nasiayam','nasilemakayam'].includes(id)){let rice=ellipse(43,53,24,20,'#f5e6bd')+path('M27 53Q35 46 43 53T60 53M29 60Q37 51 45 60T59 58','none',id==='bihun'?'#c29b63':'#dfcf9c',2);return plate+rice+path('M62 47Q83 40 84 62L73 72L58 62Z','#bc8a5d')+ellipse(72,43,9,5,'#9bb17e')+(id==='nasilemakayam'?ellipse(28,68,10,5,'#b66751'):'')}
 return '';
}
