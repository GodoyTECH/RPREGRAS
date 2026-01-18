function normalizeText(value) {
    return (value || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function normalizeSearchText(value) {
    return normalizeText(value)
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractAliases(regra) {
    const aliases = new Set();

    if (regra.codigo) {
        aliases.add(String(regra.codigo));
        aliases.add(String(regra.codigo).replace(/\./g, ''));
    }

    if (regra.nome) {
        aliases.add(regra.nome);
        const matchParenteses = regra.nome.match(/\(([^)]+)\)/g);
        if (matchParenteses) {
            matchParenteses.forEach(item => {
                const texto = item.replace(/[()]/g, '').trim();
                if (texto) {
                    aliases.add(texto);
                }
            });
        }

        regra.nome
            .split(/[/-]/g)
            .map(part => part.trim())
            .filter(Boolean)
            .forEach(part => aliases.add(part));
    }

    if (Array.isArray(regra.keywords)) {
        regra.keywords.forEach(keyword => aliases.add(keyword));
    }

    return Array.from(aliases).filter(Boolean);
}

function matchRegraPorAlias(regra, referenciaNormalizada) {
    const aliases = extractAliases(regra)
        .map(alias => normalizeSearchText(alias))
        .filter(Boolean);

    const shortAliases = new Set(['dm', 'mg', 'rk', 'db', 'vdm', 'nrp', 'rp', 'afk']);

    return aliases.some(alias => {
        if (!alias) {
            return false;
        }

        if (alias.length <= 2 && !shortAliases.has(alias)) {
            return false;
        }

        return referenciaNormalizada.includes(alias);
    });
}

// Verificação com IA
async function verificarComIA() {
    const entrada = document.getElementById('entrada').value.trim();
    if (!entrada) {
        alert('Por favor, descreva a infração ou insira um código de regra.');
        return;
    }

    // Mostrar loading
    document.getElementById('iaLoading').style.display = 'block';
    document.getElementById('resultado').innerHTML = '';
    document.getElementById('estatisticas').style.display = 'none';

    try {
        if (!window.geminiVerifyRules) {
            throw new Error('Gemini indisponível.');
        }
        const regrasIA = (window.regras || []).filter(regra => regra.categoria !== 'police');
        const resultadoGemini = await window.geminiVerifyRules(entrada, regrasIA);
        const adaptado = adaptarResultadoGemini(resultadoGemini, regrasIA);

        if (adaptado.regrasEncontradas.length > 0) {
            exibirResultados(adaptado.regrasEncontradas, adaptado.confianca, adaptado);
        } else {
            const fallback = coletarRegrasPorTexto(entrada);
            exibirResultados(fallback.regrasEncontradas, fallback.confianca, {
                summary: resultadoGemini && resultadoGemini.summary
                    ? resultadoGemini.summary
                    : 'Nenhuma regra retornada pela IA. Usando análise local.',
                source: 'fallback'
            });
        }
    } catch (erro) {
        const fallback = coletarRegrasPorTexto(entrada);
        exibirResultados(fallback.regrasEncontradas, fallback.confianca, {
            summary: 'Falha ao consultar a IA. Usando análise local.'
        });
    } finally {
        document.getElementById('iaLoading').style.display = 'none';
    }
}

// Verificação com IA (Policial)
async function verificarComIAPolicial() {
    const entrada = document.getElementById('entradaPolicial').value.trim();
    if (!entrada) {
        alert('Por favor, descreva o crime ou insira um código de artigo.');
        return;
    }

    // Mostrar loading
    document.getElementById('policeLoading').style.display = 'block';
    document.getElementById('resultadoPolicial').innerHTML = '';
    document.getElementById('estatisticasPolicial').style.display = 'none';

    try {
        if (!window.geminiVerifyRules) {
            throw new Error('Gemini indisponível.');
        }
        const regrasPoliciais = (window.regras || []).filter(regra => regra.categoria === 'police');
        const resultadoGemini = await window.geminiVerifyRules(entrada, regrasPoliciais);
        const adaptado = adaptarResultadoGemini(resultadoGemini, regrasPoliciais);

        if (adaptado.regrasEncontradas.length > 0) {
            exibirResultadosPolicial(adaptado.regrasEncontradas, adaptado.confianca, adaptado);
        } else {
            const fallback = coletarCrimesPorTexto(entrada);
            exibirResultadosPolicial(fallback.crimesEncontrados, fallback.confianca, {
                summary: resultadoGemini && resultadoGemini.summary
                    ? resultadoGemini.summary
                    : 'Nenhum crime retornado pela IA. Usando análise local.',
                source: 'fallback'
            });
        }
    } catch (erro) {
        const fallback = coletarCrimesPorTexto(entrada);
        exibirResultadosPolicial(fallback.crimesEncontrados, fallback.confianca, {
            summary: 'Falha ao consultar a IA. Usando análise local.'
        });
    } finally {
        document.getElementById('policeLoading').style.display = 'none';
    }
}

function adaptarResultadoGemini(resultadoGemini, regrasDisponiveis) {
    const matched = (resultadoGemini && resultadoGemini.matched_rules) ? resultadoGemini.matched_rules : [];
    const reasons = {};
    const confiancas = [];
    const regrasEncontradas = [];
    const regrasMap = new Map(
        regrasDisponiveis.map(regra => [normalizeText(regra.codigo), regra])
    );

    matched.forEach(match => {
        if (typeof match === 'string') {
            match = { title: match };
        }

        const codigo = match.id || match.codigo || match.rule_code;

        const titulo = match.title || match.nome;
        if (!codigo && !titulo) {
            return;
        }
function adaptarResultadoGemini(resultadoGemini, regrasDisponiveis) {
    const matched = (resultadoGemini && resultadoGemini.matched_rules) ? resultadoGemini.matched_rules : [];
    const reasons = {};
    const confiancas = [];
    const regrasEncontradas = [];
    const regrasMap = new Map(
        regrasDisponiveis.map(regra => [normalizeText(regra.codigo), regra])
    );

    matched.forEach(match => {
        if (typeof match === 'string') {
            match = { title: match };
        }

        const codigo = match.id || match.codigo || match.rule_code;

        const titulo = match.title || match.nome;
        if (!codigo && !titulo) {
            return;
        }

        const codigoNormalizado = normalizeText(codigo);
        const tituloNormalizado = normalizeSearchText(titulo);
        const codigoSemPonto = codigo ? normalizeText(codigo).replace(/\./g, '') : '';

        const regra = regrasMap.get(codigoNormalizado)
            || regrasMap.get(codigoSemPonto)
            || regrasDisponiveis.find(item => normalizeText(item.nome) === normalizeText(titulo))
            || regrasDisponiveis.find(item =>
                tituloNormalizado &&
                normalizeSearchText(item.nome) &&
                (normalizeSearchText(item.nome).includes(tituloNormalizado) ||
                    tituloNormalizado.includes(normalizeSearchText(item.nome)))
            )
            || regrasDisponiveis.find(item =>
                (tituloNormalizado && matchRegraPorAlias(item, tituloNormalizado)) ||
                (match.reason && matchRegraPorAlias(item, normalizeSearchText(match.reason)))
            );

        if (regra) {
            if (!regrasEncontradas.some(item => item.codigo === regra.codigo)) {
                regrasEncontradas.push(regra);
            }
            if (match.reason) {
                reasons[regra.codigo] = match.reason;
            }
            if (typeof match.confidence === 'number') {
                const valor = match.confidence > 1 ? match.confidence / 100 : match.confidence;
                confiancas.push(valor);
            }
        }
    });

    const confiancaMedia = confiancas.length
        ? Math.round((confiancas.reduce((total, valor) => total + valor, 0) / confiancas.length) * 100)
        : (regrasEncontradas.length ? 90 : 0);

    return {
        regrasEncontradas,
        confianca: confiancaMedia,
        reasons,
        summary: resultadoGemini ? resultadoGemini.summary : ''
    };
}


        if (regra) {
            if (!regrasEncontradas.some(item => item.codigo === regra.codigo)) {
                regrasEncontradas.push(regra);
            }
            if (match.reason) {
                reasons[regra.codigo] = match.reason;
            }
            if (typeof match.confidence === 'number') {
                const valor = match.confidence > 1 ? match.confidence / 100 : match.confidence;
                confiancas.push(valor);
            }
        }
    });

    const confiancaMedia = confiancas.length
        ? Math.round((confiancas.reduce((total, valor) => total + valor, 0) / confiancas.length) * 100)
        : (regrasEncontradas.length ? 90 : 0);

    return {
        regrasEncontradas,
        confianca: confiancaMedia,
        reasons,
        summary: resultadoGemini ? resultadoGemini.summary : ''
    };
}
