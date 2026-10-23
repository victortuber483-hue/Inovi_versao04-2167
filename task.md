# Animação de próteses vinculada ao scroll
- Pedido: vídeo fornecido logo após hero, avanço e retorno controlados pela rolagem, branding INOVI.
- Preservar hero, serviços sem preços, contatos e WhatsApp flutuante.
- Fonte: Dental_prosthesis_animation_tran…_20261023012006_Dwb7Mg.mp4, 1280×720, 24 fps, 192 frames, 8 segundos.
- Plano: extrair sequência WebP desktop/mobile; canvas sticky com cache limitado e frame proporcional ao scroll; logo + chamada na mesma seção; preferência de movimento reduzido mostra imagem estática.
- Testes: build, frame inicial/intermediário/final/retorno, celular, ausência de overflow, WhatsApp e continuidade até serviços.
- Estado: concluído. Build passou; desktop e celular verificaram avanço 0→48→115→191 e retorno 191→115→48→0, sem erros de navegador ou overflow. Hero e dois cards preservados. Movimento reduzido usa palco estático. Percurso encurtado a pedido: 240svh desktop / 220svh celular. Cache decodificado limitado a 24 imagens, até quatro carregamentos em paralelo.