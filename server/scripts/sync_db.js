const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = {
  "soft-001": {
    images: ["https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
    description: "Licença digital Vitalícia para 1 PC ou Mac. Inclui Word, Excel, PowerPoint e Outlook. A solução definitiva para profissionais e famílias que necessitam das ferramentas clássicas da Microsoft com o pagamento único. Aproveite os novos recursos de colaboração e produtividade."
  },
  "soft-002": {
    images: ["https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1629654297299-c8506221eca9?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80"],
    description: "Chave de ativação digital para Windows 11 Pro. Envio imediato via e-mail. Maximize a sua produtividade diária com a interface renovada e as ferramentas corporativas exclusivas da versão Pro, como BitLocker, Hyper-V e Remote Desktop."
  },
  "soft-003": {
    images: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80"],
    description: "Proteção essencial para os seus dispositivos contra vírus e malware. Licença de 1 ano válida para até 5 dispositivos. Navegue, compre e faça operações bancárias de forma segura. Inclui proteção em tempo real e anti-phishing."
  },
  "soft-004": {
    images: ["https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"],
    description: "Segurança cibernética avançada com VPN e gestor de passwords. Licença de 1 ano para 3 dispositivos. Defenda-se contra ransomware, otimize o desempenho do seu PC e garanta a segurança da sua identidade online com encriptação premium."
  },
  "soft-005": {
    images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"],
    description: "Proteção total com suporte técnico prioritário, VPN ilimitada e proteção de identidade. Licença de 1 ano para até 5 dispositivos. O expoente máximo da segurança pessoal para famílias modernas e indivíduos preocupados com a privacidade."
  },
  "soft-006": {
    images: ["https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=800&q=80"],
    description: "Segurança completa para Windows, macOS, iOS e Android. Licença de 1 ano. Beneficie de Secure VPN, backup avançado na cloud, gestor de passwords integrados e Dark Web Monitoring. Uma solução tudo-em-um."
  },
  "soft-calc-001": {
    images: ["https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
    description: "Licença Definitiva para profissionais. Inclui todas as aplicações clássicas do Office (Word, Excel, PowerPoint, Outlook, Publisher e Access). Uma compra única revolucionária com acesso constante às ferramentas essenciais do escritório sem subscrição mensal."
  },
  "soft-ms-001": {
    images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"],
    description: "Licença para servidores modernos. Performance e segurança de nível empresarial. Gere e controle infraestruturas de rede de grande escala, com capacidades aprimoradas para nuvem híbrida e contentores, otimizada para o centro de dados de amanhã."
  },
  "soft-ms-002": {
    images: ["https://images.unsplash.com/photo-1661956602868-6ae368943878?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1682687982501-1e58f8147d3d?auto=format&fit=crop&w=800&q=80"],
    description: "Aumente drasticamente a inteligência da sua equipa com a subscrição anual do Microsoft Copilot. Inteligência Artificial integrada diretamente nas suas aplicações de trabalho da Microsoft para escrever, desenhar, calcular e organizar."
  },
  "soft-ms-003": {
    images: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"],
    description: "Gestão de bases de dados relacional líder de mercado. Suporte a big data. Oferece escalabilidade incrível, inteligência com análise de dados e segurança reforçada para empresas de médio porte que gerem dados essenciais de negócio online."
  },
  "desk-001": {
    images: ["https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80"],
    description: "Computador Lenovo H505S. Equipado com AMD E2-1800 1.7GHz, 4GB RAM e disco HDD 500GB. Conta com gráfica dedicada Radeon HD 7030. Ideal para uso em escritório, recepções e navegação doméstica básica."
  },
  "desk-002": {
    images: ["https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80"],
    description: "Mini PC Blackview MP200. Com processador Intel Alder Lake i5-12450H, 16GB RAM e SSD M.2 de 512GB, oferecendo desempenho estrondoso num formato ultra compacto. Perfeito para pequenos escritórios, estúdios ou secretárias com pouco espaço."
  },
  "desk-003": {
    images: ["https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80"],
    description: "HP ProDesk 400 G7 microtower. Intel Core i3-10100, 8GB DDR4 RAM e SSD super rápido de 256GB NVMe. Uma máquina confiável, construída para durar longos anos nas tarefas de negócios intermédias do dia-a-dia."
  },
  "desk-004": {
    images: ["https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80"],
    description: "HP Pro Tower 400 G9 MT super robusto. Processador potente Intel Core i9-13500 para análise de dados pesados e renderização multi-tarefa. Combinado com 8GB RAM expansível e SSD NVMe de 512GB com Windows 11 Pro nativo."
  },
  "desk-005": {
    images: ["https://images.unsplash.com/photo-1587202372744-b0a1caadeed5?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80"],
    description: "Dell Optiplex 7020 MT de nível profissional. Intel Core i5-12500, com 16GB de RAM de alta frequência, SSD de 512GB e Ubuntu Linux pré-instalado. Uma workstation clássica conhecida pela sua durabilidade e eficiência térmica imbatível."
  },
  "lap-001": {
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"],
    description: "HP OmniBook 5 Flip x360 conversível premium. Intel Core i7-150U acompanhado por 16GB RAM e SSD de 1TB. Ecrã 14 Polegadas Touch WUXGA para versatilidade completa entre tablet e portátil focado em produtividade."
  },
  "lap-002": {
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1531297172867-21444458532f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"],
    description: "HP 250R G10 corporativo elegante e fiável. Ecrã de 15.6 polegadas. Alimentado pelo avançado Intel Core i5-120U, 8GB RAM e SSD 512GB. Vem com Windows 11 Pro para máxima integração nas redes corporativas."
  },
  "lap-003": {
    images: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"],
    description: "Portátil empresarial HP ProBook 440 G11 moderno com um belo acabamento prateado. O processador Intel Core u5-225U com 16GB RAM e um vasto SSD de 512GB resulta num sistema responsivo perfeito para profissionais sempre em viagem."
  },
  "esc-001": {
    images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1595514535195-8cbfaa6b8400?auto=format&fit=crop&w=800&q=80"],
    description: "Cadeira Ergonómica Miller X de elevado padrão. Design avançado com apoio lombar regulável e encosto de cabeça ajustável. A rede respirável mantém a temperatura fresca durante longas horas no escritório, suportando até 150Kg de peso."
  },
  "ele-001": {
    images: ["https://images.unsplash.com/photo-1584286595398-a49f783bedb5?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80"],
    description: "Frigorífico inteligente Samsung Side-by-Side Inox grandioso. Enorme capacidade de 647 Litros para grandes famílias. Sistema All-around Cooling, máquina de água e gelo integrada, dispensa odbcção à rede."
  },
  "ele-002": {
    images: ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80"],
    description: "Máquina de Lavar Roupa LG Vivace Branca com incrível capacidade de 9kg e sensor de inteligência artificial AI DD(R) que memoriza padrões. Possui tecnologia de injeção direta de vapor para eliminar bactérias."
  },
  "seg-001": {
    images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&w=800&q=80"],
    description: "Kit completo Profissional Hikvision. Inclui 8 Câmaras 4K à prova d'água (IP67) e visão noturna excecional DarkFighter. Inclui Gravador de 8 Canais NVR com deteção inteligente AI de humanos e veículos para reduzir falsos alarmes."
  },
  "seg-002": {
    images: ["https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1610486665780-69bc2fa77c8e?auto=format&fit=crop&w=800&q=80"],
    description: "Fechadura Inteligente Samsung D728. A solução de entrada premium. Permite abertura usando impressão biométrica ultra rápida, smartphone via Bluetooth, Cartão RFID e Teclado Numérico protegido por tecnologia antifurto."
  },
  "soft-ms-004": {
    images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
    description: "Microsoft Entra ID P2, o antigo Azure AD Premium 2. Solução completa para corporações: gestão de identidades, controlo de acessos condicional com inteligência artificial, e proteção reforçada contras identidades comprometidas em todo o mundo. Licença anual por utilizador."
  },
  "soft-ms-005": {
    images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"],
    description: "Subscrição Anual Microsoft Planner e Project Plano 3. Agilidade total na gestão de projetos profissionais na nuvem. Agende, trace roteiros gráficos pormenorizados e promova colaboração otimizada para todas as equipas num só lado."
  },
  "soft-ms-006": {
    images: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80"],
    description: "Licença única Microsoft Visio LTSC Standard 2021. Ferramenta lendária para criação de organogramas, diagramas profissionais, plantas de layout de escritórios e elaboração de fluxogramas altamente detalhados, com dezenas de formas predefinidas."
  },
  "soft-ms-007": {
    images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"],
    description: "A joia da coroa para administradores bases de dados. Licença do Microsoft SQL Server 2022 Enterprise Edition para 2 Cores. Performance em tempo real de elite, integração bidireccional ao Azure e alta disponibilidade ininterrupta."
  },
  "soft-ms-008": {
    images: ["https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"],
    description: "Subscrição empresarial do Microsoft 365 E3 por um ano (excluindo Teams da Europa). Combina as melhores apps de produtividade, incluindo pacotes instaláveis no desktop, juntamente com incríveis recursos globais e ferramentas robustas para segurança corporativa e conformidade."
  },
  "pho-001": {
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1695048133140-1a26b2b73bc0?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80"],
    description: "O mais arrojado de sempre: iPhone 15 Pro Max 256GB. Construção revolucionária e super leve em Titânio de classe aeroespacial. Novo processador A17 Pro concebido para gaming de consola, porta multifacetada USB-C e câmara versátil periscópica."
  },
  "pho-002": {
    images: ["https://images.unsplash.com/photo-1707577533831-2917719602ff?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1605236453806-6ff368528e51?auto=format&fit=crop&w=800&q=80"],
    description: "Samsung Galaxy S24 Ultra 512GB com chassis de Titânio resistente. O expoente máximo com inteligência artificial nativa Galaxy AI impressionante de tradução e edição ecrã plano fantástico munido do inconfundível stylus de eleição focado em notas ativas."
  },
  "ene-001": {
    images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80"],
    description: "Painel Solar de altíssima eficiência, Canadian Solar HiKu6 Mono PERC 450W. Células de potência máxima em baixa luminosidade da manhã e fim da tarde, apresentando excelente resistência mecânica aos ventos e chuvas. Ideal para sistemas domésticos de injecção ou isolados."
  },
  "ene-002": {
    images: ["https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"],
    description: "Bateria de Lítio (LiFePo4) da renomada marca Pylontech modelo US3000C, debitando eficazmente uns notáveis 3.5kWh e compatível em rack. Permite expansão modular paralela simplificada para construir potentes sistemas domésticos duráveis superiores aos de ácido."
  },
  "ims-001": {
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80"],
    description: "Smart TV Samsung gigantesca modelo 65 polegadas Neo QLED 4K premium com matriz inovadora Quantum Matrix Technology Pro de retro-iluminação Mini LED para pretos soberbos e cores vibrantes, fluidez fenomenal a 144Hz ideal para jogos com design Infinity One ultra fino."
  },
  "ims-002": {
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"],
    description: "Elegante Coluna Bluetooth estéreo da mítica marca Marshall Emberton II. Formato perfeitamente compacto envolto nos clássicos motivos premium granulados do rock'n roll analógicos, mas que bombeia 30 horas incríveis de som de alta nitidez multidioreccional para viagens em ar livre e churrascos."
  },
  "jog-001": {
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=800&q=80"],
    description: "Incrível entretenimento. Finalmente pode desfrutar da PlayStation 5 (Modelo Slim). Inclui unidade leitor de discos 4K Bluray. Gráficos sensoriais 4K a 120 FPS incomparavelmente fotorealistas graças também ao carregamento instantâneo via SSD de 1TB mágico."
  },
  "jog-002": {
    images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1612404730960-5c71577fca11?auto=format&fit=crop&w=800&q=80"],
    description: "Bela consola híbrida versátil Nintendo Switch agora no adorável modelo OLED. Destaque natural do belíssimo modelo são as cores luminosas do grande novo ecrã 7 polegadas OLED, colunas revistas para áudio robusto num form factor idêntico ideal aos exclusivos amados com mais de 9 horas de autonomia."
  },
  "bel-001": {
    images: ["https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80"],
    description: "Potentíssimo revolucionário Secador de mãos e Cabelo Dyson Supersonic versao HD15 em belo tom cobreado. O famoso forte motor magnético esconde-se sãos e salvas da pá para controlo perfeitamente equilibrado do ar sem escaldar danificar."
  },
  "bel-002": {
    images: ["https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"],
    description: "Confiável fiável Monitor Médico preciso aparelho Medidor de Tensão arterial Omron de braço confortável super automático de categoria modelo M3 M-Intelli. Detetor automático ultra sensitivo na identificacao crua inicial de batimentos cardíacos."
  },
  "pc-001": {
    images: ["https://images.unsplash.com/photo-1587202372744-b0a1caadeed5?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80"],
    description: "Desktop HP Victus 15L prateado. Uma silenciosa formidável torre de design elegante não chamativo mas poderosa torre interior armada ferozmente com chip super eficaz processador i7-13700F de 16 núcleos, generosos 32 GB e RTX 4060."
  },
  "pc-002": {
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80"],
    description: "Fino como navalha, o portátil emblemático intemporal clássico MacBook Air atualiza-se no super veloz silício chip M3 octa-core na edição mágica meia noite Midnight. Com formosa estrutura em alumínio e ecrã de extrema nitidez com dezesete horas de autonomia contínua."
  },
  "elect-001": {
    images: ["https://images.unsplash.com/photo-1584286595398-a49f783bedb5?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80"],
    description: "Imponente elegante lindo frigorifico Samsung Bespoke AI personalizado. Sistema modular modular que personaliza painéis maravilhosos. Ele conta incrivel inteligência de arrefecimento para inteligente conservação de todos os frescos."
  },
  "elect-002": {
    images: ["https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"],
    description: "Majestoso super minimalista e silencioso sofisticado Aparelho Sistema Ar Condicionado negro em vidro preto temperado espelhado modelo LG Artcool da capacidade fantástica forte veloz inteligente em Dual Inverter incrivelmente potente no frescor purificando."
  },
  "smart-001": {
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1695048133140-1a26b2b73bc0?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&w=800&q=80"],
    description: "O mais arrojado de sempre: iPhone 15 Pro Max 256GB. Construção revolucionária e super leve em Titânio de classe aeroespacial. Novo processador A17 Pro concebido para gaming de consola, porta multifacetada USB-C e câmara versátil periscópica."
  },
  "smart-002": {
    images: ["https://images.unsplash.com/photo-1707577533831-2917719602ff?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1605236453806-6ff368528e51?auto=format&fit=crop&w=800&q=80"],
    description: "Samsung Galaxy S24 Ultra 512GB com chassis de Titânio resistente. O expoente máximo com inteligência artificial nativa Galaxy AI impressionante de tradução e edição ecrã plano fantástico munido do inconfundível stylus de eleição focado em notas ativas."
  },
  "sec-001": {
    images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&w=800&q=80"],
    description: "Kit completo Profissional Hikvision. Inclui 8 Câmaras 4K à prova d'água (IP67) e visão noturna excecional DarkFighter. NVR inteligente IA avançado."
  },
  "ener-001": {
    images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80"],
    description: "Inversor potente majestoso super silencioso eficiente Off-Grid Growatt SPF 5.5KVA 5000es moderno apto ideal perfeito gerador puro para sustentar independentemente cargas exigentes residencias."
  },
  "game-001": {
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=800&q=80"],
    description: "Elegante consola PlayStation 5 edição inteiramente Digital focada completamente perfeita para a sua bilblioteca inteira virtualizada (sem leitor discos), incrivel carregamento sem tempos de espera garças incrivel mágico ultra rapido drive SSD."
  },
  "off-001": {
    images: ["https://images.unsplash.com/photo-1598550476439-6847785fce68?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80"],
    description: "Absolutamente majestosamente confortável de Cadeira Alpha Gamer Vega ultra durável feita revestida coberta toda numa sintética suave bonita de costuras agressivas gaming fortes."
  },
  "ener-002": {
    images: ["https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"],
    description: "Bateria de Lítio (LiFePo4) Pylontech modelo US3000C, 3.5kWh compatível em rack. Permite expansão modular paralela simplificada para construir potentes sistemas domésticos duráveis sem os malefícios e cuidados extras."
  },
  "sec-002": {
    images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&w=800&q=80"],
    description: "Câmara de segurança majestosamente IP independente Exterior autrárquica sem necessidade sem fios Reolink 4K Ultra nitidez em bateria alimentada contínuamente sol perfeitamente por pequeno prático mini lindo painel solar."
  },
  "aud-001": {
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"],
    description: "Imponentes sofisticados auscultadores modelo premium majestoso auscultador luxo Sony WH-1000XM5 ultra levez e confortável sobre a orelha. Os inquestionáveis reis absolutos da perfeição cancelamento som ambiente externo para viagens."
  }
};

async function main() {
  console.log('Synchronizing db products...');
  for (const [id, data] of Object.entries(updates)) {
    try {
      await prisma.product.update({
        where: { sku: id },
        data: {
          description: data.description,
          image: data.images[0],
          images: data.images
        }
      });
      console.log(`Updated: ${id}`);
    } catch (e) {
      console.log(`Skipped (not found or error): ${id}`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
