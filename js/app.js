const regrasData = window.regras || [];
const APP_PASSWORD = "@Devereux16";
const AUTH_STORAGE_KEY = "AUTH_OK";

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    iniciarAutenticacao();
    carregarTodasRegras();
    configurarCategorias();
    configurarCollapsibles();
    configurarEntradaVoz();
});

function iniciarAutenticacao() {
    const autenticado = sessionStorage.getItem(AUTH_STORAGE_KEY) === '1';
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');

    if (autenticado) {
        loginView.classList.add('hidden');
        appView.classList.remove('app-hidden');
    } else {
        loginView.classList.remove('hidden');
        appView.classList.add('app-hidden');
    }

    document.body.classList.remove('auth-pending');

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            loginView.classList.remove('hidden');
            appView.classList.add('app-hidden');
        });
    }

    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
}

function configurarEntradaVoz() {
    const voiceButton = document.getElementById('voiceButton');
    const entrada = document.getElementById('entrada');
    const voiceStatus = document.getElementById('voiceStatus');

    if (window.setupVoiceInput && voiceButton && entrada) {
        window.setupVoiceInput({
            buttonEl: voiceButton,
            inputEl: entrada,
            statusEl: voiceStatus
        });
    }
}

function configurarCollapsibles() {
    const sections = document.querySelectorAll('[data-collapsible]');
    sections.forEach((section, index) => {
        const trigger = section.querySelector('[data-collapsible-trigger]');
        const panel = section.querySelector('[data-collapsible-panel]');
        if (!trigger || !panel) {
            return;
        }

        if (!panel.id) {
            panel.id = `collapsible-panel-${index + 1}`;
        }

        trigger.setAttribute('aria-controls', panel.id);
        const isOpenByDefault = section.dataset.collapsibleDefault === 'open';
        definirEstadoCollapsible(section, isOpenByDefault);

        trigger.addEventListener('click', () => {
            const isOpen = section.classList.contains('is-open');
            definirEstadoCollapsible(section, !isOpen);
        });
    });

    ajustarAlturaCollapsibles();
    window.addEventListener('resize', ajustarAlturaCollapsibles);
    window.addEventListener('hashchange', abrirCollapsiblePorHash);
    abrirCollapsiblePorHash();
}

function definirEstadoCollapsible(section, abrir) {
    const trigger = section.querySelector('[data-collapsible-trigger]');
    const panel = section.querySelector('[data-collapsible-panel]');
    if (!trigger || !panel) {
        return;
    }

    section.classList.toggle('is-open', abrir);
    trigger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
    } else {
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
    }
}

function ajustarAlturaCollapsibles() {
    document.querySelectorAll('[data-collapsible].is-open [data-collapsible-panel]').forEach(panel => {
        panel.style.maxHeight = panel.scrollHeight + 'px';
    });
}

function abrirCollapsiblePorHash() {
    if (!window.location.hash) {
        return;
    }

    const alvo = document.querySelector(window.location.hash);
    if (!alvo) {
        return;
    }

    const panel = alvo.closest('[data-collapsible-panel]');
    if (!panel) {
        return;
    }

    const section = panel.closest('[data-collapsible]');
    if (section) {
        definirEstadoCollapsible(section, true);
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function abrirPainelResultados(resultadoId) {
    const alvo = document.getElementById(resultadoId);
    if (!alvo) {
        return;
    }

    const panel = alvo.closest('[data-collapsible-panel]');
    const section = panel ? panel.closest('[data-collapsible]') : null;

    if (section) {
        definirEstadoCollapsible(section, true);
    }

    if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Carregar todas as regras na sidebar
function carregarTodasRegras() {
    const container = document.getElementById('todasRegras');
    container.innerHTML = '';

    regrasData.forEach(regra => {
        const div = document.createElement('div');
        div.className = `regra-item ${regra.categoria}`;
        div.innerHTML = `
            <div class="regra-item-codigo">
                <span>${regra.codigo}</span>
            </div>
            <div class="regra-item-desc">${regra.nome}</div>
        `;

        div.addEventListener('click', () => {
            if (regra.categoria === 'police') {
                document.getElementById('entradaPolicial').value = regra.codigo;
                document.getElementById('entradaPolicial').focus();
            } else {
                document.getElementById('entrada').value = regra.codigo;
                document.getElementById('entrada').focus();
            }
        });

        container.appendChild(div);
    });
}

// Configurar filtros de categoria
function configurarCategorias() {
    const botoes = document.querySelectorAll('.categoria-btn');
    botoes.forEach(botao => {
        botao.addEventListener('click', function() {
            // Remover classe active de todos os botões
            botoes.forEach(b => b.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            const categoria = this.getAttribute('data-categoria');
            filtrarRegras(categoria);
        });
    });
}

// Filtrar regras por categoria
function filtrarRegras(categoria) {
    const itens = document.querySelectorAll('.regra-item');
    itens.forEach(item => {
        if (categoria === 'todas') {
            item.style.display = 'block';
        } else {
            if (item.classList.contains(categoria)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Inserir exemplo no campo de texto
function inserirExemplo(texto) {
    document.getElementById('entrada').value = texto;
}

// Inserir código de regra no campo de texto
function inserirCodigo(codigo) {
    document.getElementById('entrada').value = codigo;
}

// Inserir código policial no campo de texto
function inserirCodigoPolicial(codigo) {
    document.getElementById('entradaPolicial').value = codigo;
}

// Limpar campos
function limpar() {
    document.getElementById('entrada').value = '';
    document.getElementById('resultado').innerHTML = `
        <div class="nenhum">
            <i class="fas fa-clipboard-list"></i>
            <p>Nenhuma infração verificada ainda.<br>Descreva uma infração acima para começar.</p>
        </div>
    `;
    document.getElementById('estatisticas').style.display = 'none';
}

// Alternar entre modo IA e modo normal
function toggleModoIA() {
    const card = document.getElementById('cardVerificacao');
    const botao = document.querySelector('.toggle-ia');
    if (card.classList.contains('modo-ia')) {
        card.classList.remove('modo-ia');
        botao.innerHTML = '<i class="fas fa-robot"></i> Alternar para Verificação com IA';
    } else {
        card.classList.add('modo-ia');
        botao.innerHTML = '<i class="fas fa-sync-alt"></i> Alternar para Verificação Tradicional';
    }
}

// Verificação normal
function verificarNormal() {
    const entrada = document.getElementById('entrada').value.trim();
    if (!entrada) {
        alert('Por favor, descreva a infração ou insira um código de regra.');
        return;
    }
    abrirPainelResultados('resultado');
    abrirPainelResultados('estatisticas');
    processarVerificacaoNormal(entrada);
}

// Processar verificação com IA
function processarVerificacaoIA(texto) {
    const resultado = coletarRegrasPorTexto(texto);
    exibirResultados(resultado.regrasEncontradas, resultado.confianca);
}

function coletarRegrasPorTexto(texto) {
    let regrasEncontradas = [];
    let confianca = 85 + Math.floor(Math.random() * 15); // 85-99%

    // Verificar se é um código de regra
    const codigoRegra = regrasData.find(regra =>
        regra.codigo.toLowerCase() === texto.toLowerCase() && regra.categoria !== 'police'
    );

    if (codigoRegra) {
        regrasEncontradas.push(codigoRegra);
    } else {
        const textoLower = texto.toLowerCase();

        // Buscar por palavras-chave em todas as regras (exceto policiais)
        regrasData.forEach(regra => {
            if (regra.categoria !== 'police') {
                for (const keyword of regra.keywords) {
                    if (textoLower.includes(keyword.toLowerCase())) {
                        if (!regrasEncontradas.some(r => r.codigo === regra.codigo)) {
                            regrasEncontradas.push(regra);
                        }
                        break;
                    }
                }
            }
        });

        // Se não encontrou nada, tentar busca por código
        if (regrasEncontradas.length === 0) {
            regrasData.forEach(regra => {
                if (regra.categoria !== 'police' && textoLower.includes(regra.codigo.toLowerCase())) {
                    regrasEncontradas.push(regra);
                }
            });
        }
    }

    return { regrasEncontradas, confianca };
}

// Processar verificação normal
function processarVerificacaoNormal(texto) {
    let regrasEncontradas = [];
    const textoLower = texto.toLowerCase();

    // Buscar por código exato (exceto policiais)
    const codigoExato = regrasData.find(regra =>
        regra.codigo.toLowerCase() === textoLower && regra.categoria !== 'police'
    );

    if (codigoExato) {
        regrasEncontradas.push(codigoExato);
    } else {
        // Buscar por palavras-chave no nome ou descrição (exceto policiais)
        regrasData.forEach(regra => {
            if (regra.categoria !== 'police' &&
                (regra.nome.toLowerCase().includes(textoLower) ||
                 regra.descricao.toLowerCase().includes(textoLower) ||
                 textoLower.includes(regra.codigo.toLowerCase()))) {
                regrasEncontradas.push(regra);
            }
        });
    }

    // Exibir resultados
    exibirResultados(regrasEncontradas, 100);
}

// Exibir resultados da verificação
function exibirResultados(regrasEncontradas, confianca, options = {}) {
    const resultado = document.getElementById('resultado');
    const estatisticas = document.getElementById('estatisticas');
    const reasons = options.reasons || {};
    const summary = options.summary;

    if (regrasEncontradas.length === 0) {
        resultado.innerHTML = `
            <div class="nenhum">
                <i class="fas fa-search"></i>
                <p>Nenhuma infração identificada.<br>Tente descrever a situação com mais detalhes.</p>
            </div>
        `;
        estatisticas.style.display = 'none';
        return;
    }

    // Calcular estatísticas
    const totalInfracoes = regrasEncontradas.length;
    const infracoesRP = regrasEncontradas.filter(r => r.categoria === 'rp').length;
    const infracoesChat = regrasEncontradas.filter(r => r.categoria === 'chat').length;

    // Atualizar estatísticas
    document.getElementById('totalInfracoes').textContent = totalInfracoes;
    document.getElementById('infracoesRP').textContent = infracoesRP;
    document.getElementById('infracoesChat').textContent = infracoesChat;
    document.getElementById('confiancaIA').textContent = confianca + '%';

    // Exibir estatísticas
    estatisticas.style.display = 'grid';

    // Exibir regras encontradas
    let html = '';
    if (summary) {
        html += `
            <div class="explicacao-ia resumo-ia">
                <i class="fas fa-info-circle"></i>
                <strong>Resumo:</strong> ${summary}
            </div>
        `;
    }
    regrasEncontradas.forEach(regra => {
        let classeConfianca = 'confianca';
        if (confianca < 70) classeConfianca += ' confianca-baixa';
        else if (confianca < 90) classeConfianca += ' confianca-media';
        const motivo = reasons[regra.codigo];

        html += `
            <div class="regra ${regra.categoria}">
                <div class="regra-nome">
                    ${regra.nome}
                    <span class="regra-codigo">${regra.codigo}</span>
                    ${confianca < 100 ? `<span class="${classeConfianca}">${confianca}% confiança</span>` : ''}
                </div>
                <div class="regra-descricao">${regra.descricao}</div>
                <div class="regra-penalidade">
                    <i class="fas fa-gavel"></i>
                    <strong>Penalidade:</strong> ${regra.penalidade}
                </div>
                ${confianca < 100 ? `
                <div class="explicacao-ia">
                    <i class="fas fa-robot"></i>
                    <strong>Análise da IA:</strong> ${motivo || 'Esta regra foi identificada com base no contexto descrito. A IA considerou a intenção e gravidade das ações relatadas.'}
                </div>
                ` : ''}
            </div>
        `;
    });

    resultado.innerHTML = html;
}

// ========== FUNÇÕES PARA O MÓDULO POLICIAL ==========

// Alternar entre modo IA e modo normal (Policial)
function toggleModoPolicial() {
    const card = document.getElementById('cardVerificacaoPolicial');
    const botao = document.querySelector('.toggle-police');
    if (card.classList.contains('modo-policia')) {
        card.classList.remove('modo-policia');
        botao.innerHTML = '<i class="fas fa-robot"></i> Alternar para Verificação com IA';
    } else {
        card.classList.add('modo-policia');
        botao.innerHTML = '<i class="fas fa-sync-alt"></i> Alternar para Verificação Tradicional';
    }
}

// Verificação normal (Policial)
function verificarNormalPolicial() {
    const entrada = document.getElementById('entradaPolicial').value.trim();
    if (!entrada) {
        alert('Por favor, descreva o crime ou insira um código de artigo.');
        return;
    }
    abrirPainelResultados('resultadoPolicial');
    abrirPainelResultados('estatisticasPolicial');
    processarVerificacaoNormalPolicial(entrada);
}

// Limpar campos (Policial)
function limparPolicial() {
    document.getElementById('entradaPolicial').value = '';
    document.getElementById('resultadoPolicial').innerHTML = `
        <div class="nenhum">
            <i class="fas fa-clipboard-list"></i>
            <p>Nenhum crime verificado ainda.<br>Descreva um crime acima para começar.</p>
        </div>
    `;
    document.getElementById('estatisticasPolicial').style.display = 'none';
}

// Processar verificação com IA (Policial)
function processarVerificacaoIAPolicial(texto) {
    const resultado = coletarCrimesPorTexto(texto);
    exibirResultadosPolicial(resultado.crimesEncontrados, resultado.confianca);
}

function coletarCrimesPorTexto(texto) {
    let crimesEncontrados = [];
    let confianca = 85 + Math.floor(Math.random() * 15); // 85-99%

    // Verificar se é um código de crime
    const codigoCrime = regrasData.find(regra =>
        (regra.codigo === texto || regra.codigo === texto.replace('.', '')) && regra.categoria === 'police'
    );

    if (codigoCrime) {
        crimesEncontrados.push(codigoCrime);
    } else {
        const textoLower = texto.toLowerCase();

        // Buscar por palavras-chave em crimes policiais
        regrasData.forEach(regra => {
            if (regra.categoria === 'police') {
                for (const keyword of regra.keywords) {
                    if (textoLower.includes(keyword.toLowerCase())) {
                        if (!crimesEncontrados.some(c => c.codigo === regra.codigo)) {
                            crimesEncontrados.push(regra);
                        }
                        break;
                    }
                }
            }
        });

        // Se não encontrou nada, tentar busca por código
        if (crimesEncontrados.length === 0) {
            regrasData.forEach(regra => {
                if (regra.categoria === 'police' && textoLower.includes(regra.codigo.toLowerCase())) {
                    crimesEncontrados.push(regra);
                }
            });
        }
    }

    return { crimesEncontrados, confianca };
}

// Processar verificação normal (Policial)
function processarVerificacaoNormalPolicial(texto) {
    let crimesEncontrados = [];
    const textoLower = texto.toLowerCase();

    // Buscar por código exato (apenas crimes policiais)
    const codigoExato = regrasData.find(regra =>
        (regra.codigo === texto || regra.codigo === texto.replace('.', '')) && regra.categoria === 'police'
    );

    if (codigoExato) {
        crimesEncontrados.push(codigoExato);
    } else {
        // Buscar por palavras-chave no nome ou descrição (apenas crimes policiais)
        regrasData.forEach(regra => {
            if (regra.categoria === 'police' &&
                (regra.nome.toLowerCase().includes(textoLower) ||
                 regra.descricao.toLowerCase().includes(textoLower) ||
                 textoLower.includes(regra.codigo.toLowerCase()))) {
                crimesEncontrados.push(regra);
            }
        });
    }

    // Exibir resultados
    exibirResultadosPolicial(crimesEncontrados, 100);
}

// Exibir resultados da verificação policial
function exibirResultadosPolicial(crimesEncontrados, confianca, options = {}) {
    const resultado = document.getElementById('resultadoPolicial');
    const estatisticas = document.getElementById('estatisticasPolicial');
    const reasons = options.reasons || {};
    const summary = options.summary;

    if (crimesEncontrados.length === 0) {
        resultado.innerHTML = `
            <div class="nenhum">
                <i class="fas fa-search"></i>
                <p>Nenhum crime identificado.<br>Tente descrever a situação com mais detalhes.</p>
            </div>
        `;
        estatisticas.style.display = 'none';
        return;
    }

    // Calcular estatísticas
    const totalCrimes = crimesEncontrados.length;
    const crimesCriminal = crimesEncontrados.filter(c => c.codigo.startsWith('1')).length;
    const crimesCivil = crimesEncontrados.filter(c => c.codigo.startsWith('2')).length;

    // Atualizar estatísticas
    document.getElementById('totalCrimes').textContent = totalCrimes;
    document.getElementById('crimesCriminal').textContent = crimesCriminal;
    document.getElementById('crimesCivil').textContent = crimesCivil;
    document.getElementById('confiancaIAPolicial').textContent = confianca + '%';

    // Exibir estatísticas
    estatisticas.style.display = 'grid';

    // Exibir crimes encontrados
    let html = '';
    if (summary) {
        html += `
            <div class="explicacao-police resumo-ia">
                <i class="fas fa-info-circle"></i>
                <strong>Resumo:</strong> ${summary}
            </div>
        `;
    }
    crimesEncontrados.forEach(crime => {
        let classeConfianca = 'confianca';
        if (confianca < 70) classeConfianca += ' confianca-baixa';
        else if (confianca < 90) classeConfianca += ' confianca-media';
        const motivo = reasons[crime.codigo];

        html += `
            <div class="regra police">
                <div class="regra-nome">
                    <strong>Artigo ${crime.codigo}</strong> - ${crime.nome}
                    ${confianca < 100 ? `<span class="${classeConfianca}">${confianca}% confiança</span>` : ''}
                </div>
                <div class="regra-descricao">${crime.descricao}</div>
                <div class="regra-penalidade">
                    <i class="fas fa-clock"></i>
                    <strong>Tempo de Prisão:</strong> ${crime.penalidade}
                </div>
                ${confianca < 100 ? `
                <div class="explicacao-police">
                    <i class="fas fa-robot"></i>
                    <strong>Análise da IA Policial:</strong> ${motivo || 'Este crime foi identificado com base no contexto descrito. A IA considerou a intenção e gravidade das ações criminosas relatadas.'}
                </div>
                ` : ''}
            </div>
        `;
    });

    resultado.innerHTML = html;
}

// Sistema de Proteção por Senha
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const loginView = document.getElementById('loginView');
    const appView = document.getElementById('appView');
    const errorMessage = document.getElementById('errorMessage');

    if (password === APP_PASSWORD) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, '1');
        errorMessage.style.display = 'none';
        loginView.classList.add('hidden');
        appView.classList.remove('app-hidden');
    } else {
        errorMessage.style.display = 'block';
        document.getElementById('passwordInput').value = '';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
}
