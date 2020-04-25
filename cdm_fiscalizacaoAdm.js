

// VANESSA BARROS - 14.199
var form;
var codigoEtapa;
var documentoStore;

$(document).ready(function () {
    setarVariaveis();
    setaEventosCamposValidacao();
});

function setarVariaveis() {
    form = Lecom.api.ProcessAPI.currentProcess().form();
    codigoEtapa = Lecom.api.ProcessAPI.currentProcess().get().processIds.activityInstanceId;
    documentoStore = Lecom.stores.DocumentStore;
}

function setaEventosCamposValidacao() {
    /* ==================================== */
    /* INÍCIO ETAPA 17 - ANEXAR NOVA FISCAL */
    /* ==================================== */
    if (codigoEtapa == 17) {
        $(document).ready(function () {
            console.log("ETAPA 17 - ANEXAR NOTA FISCAL")
            // setartiponota();
            if (form.fields("CT_PROBLEMA_ADM").value() != undefined && form.fields("CT_PROBLEMA_ADM").value() != "" && form.fields("CT_PROBLEMA_ADM").value() != " ") {
                form.fields("L_IRREGULARIDADE").visible(true)
                form.fields("CT_PROBLEMA_ADM").visible(true).readOnly(true)
                form.apply()
            }
        });

        form.fields("TIPO_NOTA").subscribe("CHANGE", function (itemId, data, response) {
            setartiponota();
        });

        form.actions("aprovar").subscribe("SUBMIT", function (formId, actionId, reject) {
            if (form.fields("TIPO_NOTA").value() != "Nota Individual") {
                verificavaziogrid();
            }
            var errors = form.errors();
            if (Object.keys(errors).length)
                reject();
        });

        form.grids("LISTA_PROCESSO").fields("DT_VENCIMENTO_NF_M").subscribe("BLUR", function (itemId, data, response) {
            setTimeout(() => {
                checkVenctoNFGrid()
            }, 500);
        });

        form.fields("DT_VENCIMENTO_NF").subscribe("BLUR", function (itemId, data, response) {
            setTimeout(() => {
                checkVenctoNF()
            }, 500);
        });
    }

    /* ================================= */
    /* INÍCIO ETAPA 18 - SANAR PENDENCIA */
    /* ================================= */
    if (codigoEtapa == 18) {
        $(document).ready(function () {
            console.log("ETAPA 18 - SANAR PENDENCIA")
            exibeDocsObrigatorios()
            exibeEmpenhoSeExistir()
            exibePubEmpenhoSeExistir()
            // validardocumentos();
            // atualiza_gridoutros();
            // setargridoutros_tempo();
            // form.fields("L_SERVICOS_BEM")
            form.grids("DOCUMENTOS").actions('DESTROY').hidden(true);
            if (form.fields("DT_NOVO_PRAZO").value() != undefined)
                form.fields("DT_NOVO_PRAZO").visible(true).readOnly(true)
            form.apply()
        });
    }

    /* ==================================== */
    /* INÍCIO ETAPA 19 - VERIFICAR CORREÇÃO */
    /* ==================================== */
    if (codigoEtapa == 19) {
        $(document).ready(function () {
            console.log("ETAPA 19 - VERIFICAR CORREÇÃO")
            // setargridoutros_tempo();
            // validadata()
            form.fields("CT_PROBLEMA_ADM").visible(true).disabled(true)
            form.fields("DT_NOVO_PRAZO").visible(true).disabled(true)
            form.grids("DOCUMENTOS").actions('DESTROY').hidden(true)
            exibeDocsObrigatorios()
            exibeEmpenhoSeExistir()
            exibePubEmpenhoSeExistir()
            form.apply();
        });

        form.fields("L_PARECER_ADM").subscribe("CHANGE", function (itemId, data, response) {
            var parecer = form.fields("L_PARECER_ADM").value()
            if (parecer == "Reavaliar (Novo prazo)") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields('DT_NOVO_PRAZO').disabled(false).setRequired('aprovar', true)
                form.fields("RET_PENDENCIA").value('correcao')

            } else if (parecer == "Reprovado (Rescindir Contrato)") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields('DT_NOVO_PRAZO').disabled(true).setRequired('aprovar', false).value("")
                form.fields("RET_PENDENCIA").value('')

            } else {
                form.fields('CT_PROBLEMA_ADM').disabled(true).setRequired('aprovar', false).value("")
                form.fields('DT_NOVO_PRAZO').disabled(true).setRequired('aprovar', false).value("")
                form.fields("RET_PENDENCIA").value('')
            }
            form.apply();
        });


        form.actions("aprovar").subscribe("SUBMIT", function (formId, actionId, reject) {
            // verificasubmit();
            // verifica_gridoutros();
            var errors = form.errors();
            if (Object.keys(errors).length)
                reject();
        });
    }

    /* ====================================== */
    /* INÍCIO ETAPA 21 - AVALIAR FISCALIZAÇÃO */
    /* ====================================== */
    if (codigoEtapa == 21) {
        $(document).ready(function () {
            console.log("ETAPA 21 - AVALIAR FISCALIZAÇÃO")
            // alteraCSS()
            exibeEmpenhoSeExistir()
            exibePubEmpenhoSeExistir()
            exibeDocsObrigatorios()
            form.grids("DOCUMENTOS").actions('DESTROY').hidden(true);
            form.fields("CT_PROBLEMA_ADM").visible(true).disabled(true)
            form.apply()
            // validadata();
            // verificatemoutros();
            form.actions("aprovar").disabled(true).apply()
            form.actions("rejeitar").disabled(true).apply()
        });
        // setargridoutros_tempo();

        form.fields("L_PARECER_ADM").subscribe("CHANGE", function (itemId, data, response) {
            if (form.fields("L_PARECER_ADM").value() == "Solicitar ajuste Preposto") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.actions("aprovar").disabled(false).apply()
                form.actions("rejeitar").disabled(true).apply()
                form.fields("RET_PENDENCIA").value('correcao')

            } else if (form.fields("L_PARECER_ADM").value() == "Aprovado") {
                form.fields('CT_PROBLEMA_ADM').disabled(true).setRequired('aprovar', false).value("")
                form.actions("aprovar").disabled(false).apply()
                form.actions("rejeitar").disabled(true).apply()
                form.fields("RET_PENDENCIA").value('')

            } else if (form.fields("L_PARECER_ADM").value() == "Retornar documentação") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('rejeitar', true)
                form.actions("aprovar").disabled(true).apply()
                form.actions("rejeitar").disabled(false).apply()
                form.fields("RET_PENDENCIA").value('')
            }
            form.apply();
        });

        form.actions("aprovar").subscribe("SUBMIT", function (formId, actionId, reject) {
            // verificasubmit();
            // verifica_gridoutros();
            var errors = form.errors();
            if (Object.keys(errors).length)
                reject();
        });
    }

    /* ===================================== */
    /* INÍCIO ETAPA 23 - APROVAR NOTA FISCAL */
    /* ===================================== */
    if (codigoEtapa == 23) {
        $(document).ready(function () {
            console.log("ETAPA 23 - APROVAR NOTA FISCAL")
        });

        form.fields('RETORNA_DOC').value("")
        form.fields('RETORNA_NOTA').value("")
        form.fields("CT_PROBLEMA_ADM").visible(true).disabled(true)
        form.apply();

        form.fields("L_PARECER_ADM").subscribe("CHANGE", function (itemId, data, response) {
            if (form.fields("L_PARECER_ADM").value() == "Reavaliar") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields('RETORNA_NOTA').value("Sim")
                form.fields("RET_PENDENCIA").value('aprovarnf')

            } else {
                form.fields('CT_PROBLEMA_ADM').disabled(true).setRequired('aprovar', false).value("")
                form.fields('RETORNA_NOTA').value("")
                form.fields("RET_PENDENCIA").value('')
            }
            form.apply();
        });
    }

    /* ======================================= */
    /* INÍCIO ETAPA 24 - ATESTAR DOCUMENTAÇÃO */
    /* ======================================= */
    if (codigoEtapa == 24) {
        $(document).ready(function () {
            console.log("ETAPA 24 - ATESTAR DOCUMENTAÇÃO")
            // setargridoutros_tempo();
            form.grids("DOCUMENTOS").actions('DESTROY').hidden(true)
            form.fields("CT_PROBLEMA_ADM").visible(true).disabled(true)
            form.apply()
            // alteraCSS()
            exibeEmpenhoSeExistir()
            exibePubEmpenhoSeExistir()
            exibeDocsObrigatorios()
        });

        form.fields("L_PARECER_ADM").subscribe("CHANGE", function (itemId, data, response) {
            if (form.fields("L_PARECER_ADM").value() == "Reavaliar Documento (Encaminhar ao Preposto)") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true).value("")
                form.fields("RET_PENDENCIA").value('atestardoc')
            } else if (form.fields("L_PARECER_ADM").value() == "Solicitar novo Documento (Fiscal Administrativo)") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true).value("")
                form.fields("RET_PENDENCIA").value('')
            } else {
                form.fields('CT_PROBLEMA_ADM').disabled(true).setRequired('aprovar', false).value("")
                form.fields("RET_PENDENCIA").value('')
            }
            form.apply();
        });

        form.actions("aprovar").subscribe("SUBMIT", function (formId, actionId, reject) {
            // verificasubmit();
            var errors = form.errors();
            if (Object.keys(errors).length)
                reject();
        });
    }

    /* ======================================= */
    /* INÍCIO ETAPA 25 - ENCERRAR FISCALIZAÇÃO */
    /* ======================================= */
    if (codigoEtapa == 25) {
        $(document).ready(function () {
            console.log("ETAPA 25 - ENCERRAR FISCALIZAÇÃO")
            exibeTipoNotaFiscal()
            exibeDocsObrigatorios()
            exibeEmpenhoSeExistir()
            exibePubEmpenhoSeExistir()
        });
    }

    /* ========================================== */
    /* INÍCIO ETAPA 26 - INICIAR FISCALIZAÇÃO ADM */
    /* ========================================== */
    if (codigoEtapa == 26) {
        $(document).ready(function () {
            console.log("ETAPA 26 - INICIAR FISCALIZAÇÃO ADM")
            form.fields("VERIFICA_SERVICO").visible(true).setRequired('aprovar', true).disabled(true)
            form.grids("LISTA_PROCESSO").columns("NUPROCESSO").visible(true)
            form.grids("LISTA_PROCESSO").columns("SERVICO_GERAL").visible(true)
            form.grids("LISTA_PROCESSO").columns("VL_SERVICO").visible(true)
            form.grids('LISTA_PROCESSO').actions('CREATE').hidden(true)
            $('#input__NUPROCESSO').css('display', 'none')
            form.apply()
        });

        form.fields("VERIFICA_SERVICO").subscribe("CHANGE", function (itemId, data, response) {
            if (form.fields("VERIFICA_SERVICO").value() == "Sim") {
                form.grids('LISTA_PROCESSO').actions('EDIT').hidden(true)
                // zeragridoutros();
                setartemplates_t();
                seta_grid();
                seta_gridoutros();
                verificaContrato_t()

            } else {
                zeraGridListaProcesso()
            }
            form.apply();
        });

        form.fields("L_NOME_FORNECEDOR").subscribe("CHANGE", function (itemId, data, response) {
            setarcampos_t();
            form.fields("VERIFICA_SERVICO").disabled(false).apply()
            // zeragridoutros();
        });

        form.grids("LISTA_PROCESSO").subscribe("GRID_DESTROY", function (itemId, data, response) {
            calculatotal_t();
        });

        form.grids("DOCUMENTOS").fields("NUCONTRATO").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
            form.grids("DOCUMENTOS").fields("NUCONTRATO").value(form.fields("L_NOME_FORNECEDOR").value()).apply();
        });

        form.actions("aprovar").subscribe("SUBMIT", function (formId, actionId, reject) {
            verificagridservico();
            var errors = form.errors();
            if (Object.keys(errors).length)
                reject();
        });
    }

    /* ======================================== */
    /* INÍCIO ETAPA 27 - VERIFICAR DOCUMENTAÇÃO */
    /* ======================================== */
    if (codigoEtapa == 27) {
        $(document).ready(function () {
            console.log("ETAPA 27 - VERIFICAR DOCUMENTAÇÃO")
            // Form.fields('T_CNPJ').linebreak('SIMPLES').apply();
            docsObrigatorios()
            templateBotaoAddSL()
            adicionaNovaNotaEmpenho()
            adicionaNovaPubNotaEmpenho()
            camposEmpenhoEPubNaoValidados()

            if (form.fields("CT_PROBLEMA_ADM").value() != undefined) {
                form.fields("L_IRREGULARIDADE").visible(true)
                form.fields("CT_PROBLEMA_ADM").visible(true).readOnly(true)
                form.apply()
            }
        });

        //form.grids("DOCUMENTOS").actions('DESTROY').hidden(true);
        form.grids("DOCUMENTOS").fields("NUCONTRATO").value(form.fields("L_NOME_FORNECEDOR").value()).apply();
        // validadata();

        form.grids("DOCUMENTOS").fields("NUCONTRATO").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
            form.grids("DOCUMENTOS").fields("NUCONTRATO").value(form.fields("L_NOME_FORNECEDOR").value()).apply();
        });

        form.fields("DT_UNIAO").subscribe("BLUR", function (itemId, data, response) {
            setTimeout(() => {
                validade("DT_UNIAO")
            }, 500);
        })

        form.fields("DT_TRAB").subscribe("BLUR", function (itemId, data, response) {
            setTimeout(() => {
                validade("DT_TRAB")
            }, 500);
        })

        form.fields("DT_FGTS").subscribe("BLUR", function (itemId, data, response) {
            setTimeout(() => {
                validade("DT_FGTS")
            }, 500);
        })
    }

    /* ========================================== */
    /* INÍCIO ETAPA 28 - ATESTAR FISCALIZAÇÃO ADM */
    /* ========================================== */
    if (codigoEtapa == 28) {
        $(document).ready(function () {
            console.log("🔴 ETAPA 28 - ATESTAR FISCALIZAÇÃO ADM 🔴")
            // seta_verificatemoutros();
            // zerack();
            // alteraCSS()
            exibeEmpenhoSeExistir()
            exibePubEmpenhoSeExistir()
            exibeDocsObrigatorios()
            form.fields("CT_PROBLEMA_ADM").visible(true).disabled(true).apply()
            document.getElementById("input__L_PARECER_ADM").style.width = "515px"
            // zeraAprovacaoGrid()
        });

        form.grids("DOCUMENTOS").actions('DESTROY').hidden(true)
        form.fields('RETORNA_DOC').value("")
        form.fields('RETORNA_NOTA').value("")
        form.apply();

        form.fields("L_PARECER_ADM").subscribe("CHANGE", function (itemId, data, response) {
            if (form.fields("L_PARECER_ADM").value() == "Problema de documentação(Segue para o Preposto)") {
                form.fields('RETORNA_DOC').value("Sim")
                form.fields('RETORNA_NOTA').value("")
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields("RET_PENDENCIA").value('adm_doc')

            } else if (form.fields("L_PARECER_ADM").value() == "Problema com a Nota Fiscal(Segue para o Preposto)") {
                form.fields('RETORNA_NOTA').value("Sim")
                form.fields('RETORNA_DOC').value("")
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields("RET_PENDENCIA").value('adm_nf')

            } else if (form.fields("L_PARECER_ADM").value() == "Problemas: Documentação e Nota fiscal(Segue para o Preposto)") {
                form.fields('RETORNA_DOC').value("Sim")
                form.fields('RETORNA_NOTA').value("Sim")
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields("RET_PENDENCIA").value('adm_docnf')

            } else if (form.fields("L_PARECER_ADM").value() == "Solicitar novo documento (Fiscal Administrativo)") {
                form.fields('RETORNA_DOC').value("")
                form.fields('RETORNA_NOTA').value("")
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields("RET_PENDENCIA").value('')
            }
            else {
                form.fields('RETORNA_DOC').value("")
                form.fields('RETORNA_NOTA').value("")
                form.fields('CT_PROBLEMA_ADM').disabled(true).setRequired('aprovar', false).value("")
                form.fields("RET_PENDENCIA").value('')
            }
            form.apply();
        });

        form.actions("aprovar").subscribe("SUBMIT", function (formId, actionId, reject) {
            // verificasubmit();
            var errors = form.errors();
            if (Object.keys(errors).length)
                reject();
        });
    }


    /* ======================================= */
    /* INÍCIO ETAPA 29 - VERIFICAR NOTA FISCAL */
    /* ======================================= */
    if (codigoEtapa == 29) {
        $(document).ready(function () {
            console.log("ETAPA 29 - VERIFICAR NOTA FISCAL")
            form.fields("CT_PROBLEMA_ADM").visible(true).disabled(true).apply()
            // seta_verificatemoutros();
            // zerack();
            // alteraCSS()
        });

        form.fields("L_PARECER_ADM").subscribe("CHANGE", function (itemId, data, response) {
            if (form.fields("L_PARECER_ADM").value() == "Reavaliar") {
                form.fields('CT_PROBLEMA_ADM').disabled(false).setRequired('aprovar', true)
                form.fields("RET_PENDENCIA").value('verificarnf')

            } else {
                form.fields('CT_PROBLEMA_ADM').disabled(true).setRequired('aprovar', false).value("")
                form.fields("RET_PENDENCIA").value('')
            }
            form.apply();
        });
    }
}

function checkVenctoNFGrid() {
    var emissao = form.grids("LISTA_PROCESSO").fields("DT_EMISSAO_NF_M").value()
    var emissao_inv = emissao.substring(6, 10) + '/' + emissao.substring(3, 5) + '/' + emissao.substring(0, 2)
    var vencto = form.grids("LISTA_PROCESSO").fields("DT_VENCIMENTO_NF_M").value()
    var vencto_inv = vencto.substring(6, 10) + '/' + vencto.substring(3, 5) + '/' + vencto.substring(0, 2)

    if (vencto_inv < emissao_inv) {
        // alert("A data de vencimento da Nota Fiscal é inferior a sua emissão. Favor revisar.")
        // form.grids("LISTA_PROCESSO").fields("DT_VENCIMENTO_NF_M").value("").apply()
        form.addCustomModal({
            title: "ATENÇÃO",
            description: "A data de vencimento da Nota Fiscal é inferior a sua emissão. Favor revisar.",
            showButtonClose: false,
            buttons: [{
                name: "Fechar",
                closeOnClick: true,
                action: function () {
                    form.grids("LISTA_PROCESSO").fields("DT_VENCIMENTO_NF_M").value("").apply()
                    $('.lean-overlay').css('display', 'none');
                }
            }]
        });
    }
}

function checkVenctoNF() {
    var emissao = form.fields("DT_EMISSAO_NF").value()
    var emissao_inv = emissao.substring(6, 10) + '/' + emissao.substring(3, 5) + '/' + emissao.substring(0, 2)
    var vencto = form.fields("DT_VENCIMENTO_NF").value()
    var vencto_inv = vencto.substring(6, 10) + '/' + vencto.substring(3, 5) + '/' + vencto.substring(0, 2)

    if (vencto_inv < emissao_inv) {
        // alert("A data de vencimento da Nota Fiscal é inferior a sua emissão. Favor revisar.")
        // form.fields("DT_VENCIMENTO_NF").value("").apply()
        form.addCustomModal({
            title: "ATENÇÃO",
            description: "A data de vencimento da Nota Fiscal é inferior a sua emissão. Favor revisar.",
            showButtonClose: false,
            buttons: [{
                name: "Fechar",
                closeOnClick: true,
                action: function () {
                    form.fields("DT_VENCIMENTO_NF").value("").apply()
                    $('.lean-overlay').css('display', 'none');
                }
            }]
        });
    }
}

function validade(campo) {
    var day = form.fields(campo).value()
    var day_inv = day.substring(6, 10) + '/' + day.substring(3, 5) + '/' + day.substring(0, 2)
    var hoje = new Date(),
        dia = hoje.getDate().toString(),
        diaF = (dia.length == 1) ? '0' + dia : dia,
        mes = (hoje.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0' + mes : mes,
        anoF = hoje.getFullYear();
    var hoje_vl = diaF + "/" + mesF + "/" + anoF;
    var hoje_inv = hoje_vl.substring(6, 10) + '/' + hoje_vl.substring(3, 5) + '/' + hoje_vl.substring(0, 2)

    if (day_inv < hoje_inv) {
        // alert("A data de vencimento do FGTS é inferior a data de hoje. Favor revisar.")
        // form.fields("DT_FGTS").value("").apply()
        form.addCustomModal({
            title: "ATENÇÃO",
            description: "A validade precisa ser igual ou superior a data de hoje. Favor revisar.",
            showButtonClose: false,
            buttons: [{
                name: "Fechar",
                closeOnClick: true,
                action: function () {
                    form.fields(campo).value("").apply()
                    $('.lean-overlay').css('display', 'none');
                }
            }]
        });
    }
}

function exibeTipoNotaFiscal() {
    var grid = form.grids("LISTA_PROCESSO")
    if (form.fields("TIPO_NOTA").value() == "Multiplas Notas") {
        grid.visible(true).readOnly(true)

    } else {
        form.fields("L_ANEXAR_NOTA_FISCAL").visible(true)
        form.fields("L_SERVICO_GERAL_I").visible(true).readOnly(true)
        form.fields("NU_NOTA_FISCAL").visible(true).readOnly(true)
        form.fields("T_NOTA_FISCAL").visible(true).readOnly(true)
        form.fields("DT_EMISSAO_NF").visible(true).readOnly(true)
        form.fields("DT_VENCIMENTO_NF").visible(true).readOnly(true)
    }
    form.apply()
}

function docsObrigatorios() {
    var valor = form.fields("TIPO_COBRANCA").value()
    form.fields("LB_EMPENHO").visible(true)
    form.fields("TP_NOTA_EMPENHO").visible(true).setRequired('aprovar', true)
    form.fields("AD_NOTA_EMPENHO").visible(true).readOnly(true)
    form.fields("TP_PUB_EMPENHO").visible(true).setRequired('aprovar', true)
    form.fields("AD_PUB_EMPENHO").visible(true).readOnly(true)
    form.fields("T_TERMO_REFERENCIA").visible(true).setRequired('aprovar', true)
    // form.fields("T_NOTA_FISCAL").visible(true).setRequired('aprovar', true)
    form.fields("T_REQUISICAO_PGTO").visible(true).setRequired('aprovar', true)
    form.fields("T_EXTRATO_CONTRATO").visible(true).setRequired('aprovar', true)
    form.fields("TP_CONTRATO").visible(true).setRequired('aprovar', true)
    form.fields("TP_MAPA_CONTROLE").visible(true).setRequired('aprovar', true)
    form.fields("TP_PARECER_FISC").visible(true).setRequired('aprovar', true)
    form.fields("TP_SIGFIS").visible(true).setRequired('aprovar', true)
    form.fields("TP_INCORPORACAO_BEM").visible(true)
    form.fields("TP_DESPACHO_CONTABIL").visible(true).setRequired('aprovar', true)
    form.fields("TP_COMPROVANTE_ENTREGA").visible(true).setRequired('aprovar', true)
    form.fields("TP_COMPROVANTE_ATO").visible(true).setRequired('aprovar', true)
    form.fields("TP_PORTARIA_FISCAL").visible(true).setRequired('aprovar', true)


    if (valor == "Tomada de Preço") {
        form.fields("TP_SOLIC_COMPRAS").visible(true).setRequired('aprovar', true)
        form.fields("TP_MEMORIA_CALCULO").visible(true).setRequired('aprovar', true)
    }

    if (valor == "Concorrência") {
        form.fields("TP_DESPACHO_CONTABIL").visible(false).setRequired('aprovar', false)
    }

    if (valor == "Convênio") {
        form.fields("T_TERMO_REFERENCIA").visible(false).setRequired('aprovar', false)
        form.fields("T_EXTRATO_CONTRATO").visible(false).setRequired('aprovar', false)
        form.fields("TP_CONTRATO").visible(false).setRequired('aprovar', false)
        form.fields("TP_INCORPORACAO_BEM").visible(false)

        form.fields("TP_TERMO_FOMENTO").visible(true).setRequired('aprovar', true)
        form.fields("TP_ATO_CONSTITUTIVO").visible(true).setRequired('aprovar', true)
        form.fields("TP_PUB_EXTR_FOMENTO").visible(true).setRequired('aprovar', true)
        form.fields("TP_IND_RECUR_ORC").visible(true).setRequired('aprovar', true)
    }

    if (valor == "Atas de Registro de Preço") {
        form.fields("TP_SOLIC_COMPRAS").visible(true).setRequired('aprovar', true)
        // form.fields("T_NOTA_FISCAL").visible(false).setRequired('aprovar', false)
        form.fields("T_REQUISICAO_PGTO").visible(false).setRequired('aprovar', false)
        form.fields("TP_MAPA_CONTROLE").visible(false).setRequired('aprovar', false)
        form.fields("TP_SIGFIS").visible(false).setRequired('aprovar', false)
        form.fields("TP_INCORPORACAO_BEM").visible(false)
        form.fields("TP_DESPACHO_CONTABIL").visible(false).setRequired('aprovar', false)
        form.fields("TP_ATA_REG_PRECO").visible(true).setRequired('aprovar', true)
        form.fields("TP_PUB_ATA_REG_PRECO").visible(true).setRequired('aprovar', true)
        form.fields("TP_CONTROLE_QUANT").visible(true).setRequired('aprovar', true)
    }

    if (valor == "Dispensa/Inexigibilidade(Contratação Direta)") {
        form.fields("TP_SOLIC_COMPRAS").visible(true).setRequired('aprovar', true)
        form.fields("T_TERMO_REFERENCIA").visible(false).setRequired('aprovar', false)
        // form.fields("T_NOTA_FISCAL").visible(false).setRequired('aprovar', false)
        form.fields("T_REQUISICAO_PGTO").visible(false).setRequired('aprovar', false)
        form.fields("T_EXTRATO_CONTRATO").visible(false).setRequired('aprovar', false)
        form.fields("TP_CONTRATO").visible(false).setRequired('aprovar', false)
        form.fields("TP_MAPA_CONTROLE").visible(false).setRequired('aprovar', false)
        form.fields("TP_PARECER_FISC").visible(false).setRequired('aprovar', false)
        form.fields("TP_SIGFIS").visible(false).setRequired('aprovar', false)
        form.fields("TP_INCORPORACAO_BEM").visible(false)
        form.fields("TP_DESPACHO_CONTABIL").visible(false).setRequired('aprovar', false)
    }
    form.apply()
}

function exibeDocsObrigatorios() {
    var valor = form.fields("TIPO_COBRANCA").value()
    form.fields("LB_EMPENHO").visible(true)
    form.fields("TP_NOTA_EMPENHO").visible(true).readOnly(true)
    form.fields("TP_PUB_EMPENHO").visible(true).readOnly(true)
    form.fields("T_TERMO_REFERENCIA").visible(true).readOnly(true)
    // form.fields("T_NOTA_FISCAL").visible(true).readOnly(true)
    form.fields("T_REQUISICAO_PGTO").visible(true).readOnly(true)
    form.fields("T_EXTRATO_CONTRATO").visible(true).readOnly(true)
    form.fields("TP_CONTRATO").visible(true).readOnly(true)
    form.fields("TP_MAPA_CONTROLE").visible(true).readOnly(true)
    form.fields("TP_PARECER_FISC").visible(true).readOnly(true)
    form.fields("TP_SIGFIS").visible(true).readOnly(true)
    form.fields("TP_INCORPORACAO_BEM").visible(true).readOnly(true)
    form.fields("TP_DESPACHO_CONTABIL").visible(true).readOnly(true)
    form.fields("TP_COMPROVANTE_ENTREGA").visible(true).readOnly(true)
    form.fields("TP_COMPROVANTE_ATO").visible(true).readOnly(true)
    form.fields("TP_PORTARIA_FISCAL").visible(true).readOnly(true)

    if (valor == "Tomada de Preço") {
        form.fields("TP_SOLIC_COMPRAS").visible(true).readOnly(true)
        form.fields("TP_MEMORIA_CALCULO").visible(true).readOnly(true)
    }

    if (valor == "Concorrência") {
        form.fields("TP_DESPACHO_CONTABIL").visible(false)
    }

    if (valor == "Convênio") {
        form.fields("T_TERMO_REFERENCIA").visible(false)
        form.fields("T_EXTRATO_CONTRATO").visible(false)
        form.fields("TP_CONTRATO").visible(false)
        form.fields("TP_INCORPORACAO_BEM").visible(false)
        form.fields("TP_TERMO_FOMENTO").visible(true).readOnly(true)
        form.fields("TP_ATO_CONSTITUTIVO").visible(true).readOnly(true)
        form.fields("TP_PUB_EXTR_FOMENTO").visible(true).readOnly(true)
        form.fields("TP_IND_RECUR_ORC").visible(true).readOnly(true)
    }

    if (valor == "Atas de Registro de Preço") {
        form.fields("TP_SOLIC_COMPRAS").visible(true).readOnly(true)
        // form.fields("T_NOTA_FISCAL").visible(false).setRequired('aprovar', false)
        form.fields("T_REQUISICAO_PGTO").visible(false)
        form.fields("TP_MAPA_CONTROLE").visible(false)
        form.fields("TP_SIGFIS").visible(false)
        form.fields("TP_INCORPORACAO_BEM").visible(false)
        form.fields("TP_DESPACHO_CONTABIL").visible(false)
        form.fields("TP_ATA_REG_PRECO").visible(true).readOnly(true)
        form.fields("TP_PUB_ATA_REG_PRECO").visible(true).readOnly(true)
        form.fields("TP_CONTROLE_QUANT").visible(true).readOnly(true)
    }

    if (valor == "Dispensa/Inexigibilidade(Contratação Direta)") {
        form.fields("LB_EMPENHO").visible(false)
        form.fields("T_TERMO_REFERENCIA").visible(false)
        // form.fields("T_NOTA_FISCAL").visible(false)
        form.fields("T_REQUISICAO_PGTO").visible(false)
        form.fields("T_EXTRATO_CONTRATO").visible(false)
        form.fields("TP_CONTRATO").visible(false)
        form.fields("TP_MAPA_CONTROLE").visible(false)
        form.fields("TP_PARECER_FISC").visible(false)
        form.fields("TP_SIGFIS").visible(false)
        form.fields("TP_INCORPORACAO_BEM").visible(false)
        form.fields("TP_DESPACHO_CONTABIL").visible(false)
        form.fields("TP_SOLIC_COMPRAS").visible(true).readOnly(true)
    }
    form.apply()
}

function templateBotaoAddSL() {
    form.fields("TP_NOTA_EMPENHO").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO02").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO02").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO02").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO02").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO03").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO03").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO03").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO03").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO04").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO04").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO04").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO04").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO05").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO05").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO05").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO05").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO06").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO06").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO06").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO06").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO07").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO07").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO07").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO07").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO08").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO08").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO08").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO08").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_NOTA_EMPENHO09").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_NOTA_EMPENHO09").value().length > 1) {
            form.fields("AD_NOTA_EMPENHO09").readOnly(false)
        } else {
            form.fields("AD_NOTA_EMPENHO09").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO").value().length > 1) {
            form.fields("AD_PUB_EMPENHO").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO02").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO02").value().length > 1) {
            form.fields("AD_PUB_EMPENHO02").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO02").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO03").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO03").value().length > 1) {
            form.fields("AD_PUB_EMPENHO03").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO03").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO04").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO04").value().length > 1) {
            form.fields("AD_PUB_EMPENHO04").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO04").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO05").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO05").value().length > 1) {
            form.fields("AD_PUB_EMPENHO05").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO05").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO06").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO06").value().length > 1) {
            form.fields("AD_PUB_EMPENHO06").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO06").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO07").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO07").value().length > 1) {
            form.fields("AD_PUB_EMPENHO07").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO07").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO08").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO08").value().length > 1) {
            form.fields("AD_PUB_EMPENHO08").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO08").readOnly(true)
        }
        form.apply();
    });

    form.fields("TP_PUB_EMPENHO09").subscribe("SET_FIELD_VALUE", function (itemId, data, response) {
        if (form.fields("TP_PUB_EMPENHO09").value().length > 1) {
            form.fields("AD_PUB_EMPENHO09").readOnly(false)
        } else {
            form.fields("AD_PUB_EMPENHO09").readOnly(true)
        }
        form.apply();
    });
}

function adicionaNovaNotaEmpenho() {
    // BOTÃO ADICIONAR 1
    form.fields("AD_NOTA_EMPENHO").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO").value() == "sim") {
            form.fields("TP_NOTA_EMPENHO02").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO02").visible(true).readOnly(true)

        } else {
            form.fields("TP_NOTA_EMPENHO02").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO02").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO02").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 2
    form.fields("AD_NOTA_EMPENHO02").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO02").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO").readOnly(true)
            form.fields("TP_NOTA_EMPENHO03").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO03").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO").readOnly(false)
            form.fields("TP_NOTA_EMPENHO03").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO03").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO03").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 3
    form.fields("AD_NOTA_EMPENHO03").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO03").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO02").readOnly(true)
            form.fields("TP_NOTA_EMPENHO04").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO04").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO02").readOnly(false)
            form.fields("TP_NOTA_EMPENHO04").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO04").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO04").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 4
    form.fields("AD_NOTA_EMPENHO04").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO04").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO03").readOnly(true)
            form.fields("TP_NOTA_EMPENHO05").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO05").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO03").readOnly(false)
            form.fields("TP_NOTA_EMPENHO05").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO05").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO05").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 5
    form.fields("AD_NOTA_EMPENHO05").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO05").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO04").readOnly(true)
            form.fields("TP_NOTA_EMPENHO06").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO06").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO04").readOnly(false)
            form.fields("TP_NOTA_EMPENHO06").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO06").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO06").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 6
    form.fields("AD_NOTA_EMPENHO06").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO06").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO05").readOnly(true)
            form.fields("TP_NOTA_EMPENHO07").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO07").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO05").readOnly(false)
            form.fields("TP_NOTA_EMPENHO07").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO07").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO07").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 7
    form.fields("AD_NOTA_EMPENHO07").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO07").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO06").readOnly(true)
            form.fields("TP_NOTA_EMPENHO08").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO08").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO06").readOnly(false)
            form.fields("TP_NOTA_EMPENHO08").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO08").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO08").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 8
    form.fields("AD_NOTA_EMPENHO08").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO08").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO07").readOnly(true)
            form.fields("TP_NOTA_EMPENHO09").visible(true).setRequired('aprovar', true)
            form.fields("AD_NOTA_EMPENHO09").visible(true).readOnly(true)

        } else {
            form.fields("AD_NOTA_EMPENHO07").readOnly(false)
            form.fields("TP_NOTA_EMPENHO09").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO09").value("").apply()
            }, 100);
            form.fields("AD_NOTA_EMPENHO09").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 9
    form.fields("AD_NOTA_EMPENHO09").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_NOTA_EMPENHO09").value() == "sim") {
            form.fields("AD_NOTA_EMPENHO08").readOnly(true)
            form.fields("TP_NOTA_EMPENHO10").visible(true).setRequired('aprovar', true)

        } else {
            form.fields("AD_NOTA_EMPENHO08").readOnly(false)
            form.fields("TP_NOTA_EMPENHO10").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_NOTA_EMPENHO10").value("").apply()
            }, 100);
        }
        form.apply();
    });
}

function adicionaNovaPubNotaEmpenho() {
    // BOTÃO ADICIONAR 1
    form.fields("AD_PUB_EMPENHO").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO").value() == "sim") {
            form.fields("TP_PUB_EMPENHO02").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO02").visible(true).readOnly(true)

        } else {
            form.fields("TP_PUB_EMPENHO02").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO02").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO02").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 2
    form.fields("AD_PUB_EMPENHO02").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO02").value() == "sim") {
            form.fields("AD_PUB_EMPENHO").readOnly(true)
            form.fields("TP_PUB_EMPENHO03").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO03").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO").readOnly(false)
            form.fields("TP_PUB_EMPENHO03").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO03").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO03").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 3
    form.fields("AD_PUB_EMPENHO03").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO03").value() == "sim") {
            form.fields("AD_PUB_EMPENHO02").readOnly(true)
            form.fields("TP_PUB_EMPENHO04").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO04").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO02").readOnly(false)
            form.fields("TP_PUB_EMPENHO04").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO04").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO04").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 4
    form.fields("AD_PUB_EMPENHO04").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO04").value() == "sim") {
            form.fields("AD_PUB_EMPENHO03").readOnly(true)
            form.fields("TP_PUB_EMPENHO05").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO05").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO03").readOnly(false)
            form.fields("TP_PUB_EMPENHO05").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO05").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO05").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 5
    form.fields("AD_PUB_EMPENHO05").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO05").value() == "sim") {
            form.fields("AD_PUB_EMPENHO04").readOnly(true)
            form.fields("TP_PUB_EMPENHO06").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO06").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO04").readOnly(false)
            form.fields("TP_PUB_EMPENHO06").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO06").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO06").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 6
    form.fields("AD_PUB_EMPENHO06").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO06").value() == "sim") {
            form.fields("AD_PUB_EMPENHO05").readOnly(true)
            form.fields("TP_PUB_EMPENHO07").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO07").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO05").readOnly(false)
            form.fields("TP_PUB_EMPENHO07").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO07").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO07").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 7
    form.fields("AD_PUB_EMPENHO07").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO07").value() == "sim") {
            form.fields("AD_PUB_EMPENHO06").readOnly(true)
            form.fields("TP_PUB_EMPENHO08").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO08").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO06").readOnly(false)
            form.fields("TP_PUB_EMPENHO08").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO08").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO08").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 8
    form.fields("AD_PUB_EMPENHO08").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO08").value() == "sim") {
            form.fields("AD_PUB_EMPENHO07").readOnly(true)
            form.fields("TP_PUB_EMPENHO09").visible(true).setRequired('aprovar', true)
            form.fields("AD_PUB_EMPENHO09").visible(true).readOnly(true)

        } else {
            form.fields("AD_PUB_EMPENHO07").readOnly(false)
            form.fields("TP_PUB_EMPENHO09").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO09").value("").apply()
            }, 100);
            form.fields("AD_PUB_EMPENHO09").visible(false)
        }
        form.apply();
    });

    // BOTÃO ADICIONAR 9
    form.fields("AD_PUB_EMPENHO09").subscribe("CHANGE", function (itemId, data, response) {
        if (form.fields("AD_PUB_EMPENHO09").value() == "sim") {
            form.fields("AD_PUB_EMPENHO08").readOnly(true)
            form.fields("TP_PUB_EMPENHO10").visible(true).setRequired('aprovar', true)

        } else {
            form.fields("AD_PUB_EMPENHO08").readOnly(false)
            form.fields("TP_PUB_EMPENHO10").visible(false).setRequired('aprovar', false)
            setTimeout(() => {
                form.fields("TP_PUB_EMPENHO10").value("").apply()
            }, 100);
        }
        form.apply();
    });
}

function exibeEmpenhoSeExistir() {
    var valor = form.fields("TIPO_COBRANCA").value()
    form.fields("LB_EMPENHO").visible(true)
    // form.fields("TP_NOTA_EMPENHO_CK").visible(true).setRequired('aprovar', true)
    if (form.fields("TP_NOTA_EMPENHO").value() != undefined)
        form.fields("TP_NOTA_EMPENHO").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO02").value() != undefined)
        form.fields("TP_NOTA_EMPENHO02").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO03").value() != undefined)
        form.fields("TP_NOTA_EMPENHO03").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO04").value() != undefined)
        form.fields("TP_NOTA_EMPENHO04").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO05").value() != undefined)
        form.fields("TP_NOTA_EMPENHO05").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO06").value() != undefined)
        form.fields("TP_NOTA_EMPENHO06").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO07").value() != undefined)
        form.fields("TP_NOTA_EMPENHO07").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO08").value() != undefined)
        form.fields("TP_NOTA_EMPENHO08").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO09").value() != undefined)
        form.fields("TP_NOTA_EMPENHO09").visible(true).readOnly(true)
    if (form.fields("TP_NOTA_EMPENHO10").value() != undefined)
        form.fields("TP_NOTA_EMPENHO10").visible(true).readOnly(true)
    form.apply()
}

function exibePubEmpenhoSeExistir() {
    var valor = form.fields("TIPO_COBRANCA").value()
    // form.fields("TP_PUB_EMPENHO_CK").visible(true).setRequired('aprovar', true)
    if (form.fields("TP_PUB_EMPENHO").value() != undefined)
        form.fields("TP_PUB_EMPENHO").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO02").value() != undefined)
        form.fields("TP_PUB_EMPENHO02").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO03").value() != undefined)
        form.fields("TP_PUB_EMPENHO03").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO04").value() != undefined)
        form.fields("TP_PUB_EMPENHO04").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO05").value() != undefined)
        form.fields("TP_PUB_EMPENHO05").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO06").value() != undefined)
        form.fields("TP_PUB_EMPENHO06").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO07").value() != undefined)
        form.fields("TP_PUB_EMPENHO07").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO08").value() != undefined)
        form.fields("TP_PUB_EMPENHO08").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO09").value() != undefined)
        form.fields("TP_PUB_EMPENHO09").visible(true).readOnly(true)
    if (form.fields("TP_PUB_EMPENHO10").value() != undefined)
        form.fields("TP_PUB_EMPENHO10").visible(true).readOnly(true)
    form.apply()
}

function camposEmpenhoEPubNaoValidados() {
    // EMPENHO
    if (form.fields("TP_NOTA_EMPENHO").value() != null)
        form.fields("AD_NOTA_EMPENHO").readOnly(false)
    if (form.fields("AD_NOTA_EMPENHO").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO02").visible(true)
        form.fields("AD_NOTA_EMPENHO02").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO02").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO03").visible(true)
        form.fields("AD_NOTA_EMPENHO03").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO03").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO04").visible(true)
        form.fields("AD_NOTA_EMPENHO04").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO04").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO05").visible(true)
        form.fields("AD_NOTA_EMPENHO05").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO05").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO06").visible(true)
        form.fields("AD_NOTA_EMPENHO06").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO06").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO07").visible(true)
        form.fields("AD_NOTA_EMPENHO07").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO07").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO08").visible(true)
        form.fields("AD_NOTA_EMPENHO08").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO08").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO09").visible(true)
        form.fields("AD_NOTA_EMPENHO09").visible(true)
    }
    if (form.fields("AD_NOTA_EMPENHO09").value() == "sim") {
        form.fields("TP_NOTA_EMPENHO10").visible(true)
    }

    // PUBLICAÇÃO EMPENHO
    if (form.fields("TP_PUB_EMPENHO").value() != null)
        form.fields("AD_PUB_EMPENHO").readOnly(false)
    if (form.fields("AD_PUB_EMPENHO").value() == "sim") {
        form.fields("TP_PUB_EMPENHO02").visible(true)
        form.fields("AD_PUB_EMPENHO02").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO02").value() == "sim") {
        form.fields("TP_PUB_EMPENHO03").visible(true)
        form.fields("AD_PUB_EMPENHO03").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO03").value() == "sim") {
        form.fields("TP_PUB_EMPENHO04").visible(true)
        form.fields("AD_PUB_EMPENHO04").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO04").value() == "sim") {
        form.fields("TP_PUB_EMPENHO05").visible(true)
        form.fields("AD_PUB_EMPENHO05").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO05").value() == "sim") {
        form.fields("TP_PUB_EMPENHO06").visible(true)
        form.fields("AD_PUB_EMPENHO06").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO06").value() == "sim") {
        form.fields("TP_PUB_EMPENHO07").visible(true)
        form.fields("AD_PUB_EMPENHO07").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO07").value() == "sim") {
        form.fields("TP_PUB_EMPENHO08").visible(true)
        form.fields("AD_PUB_EMPENHO08").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO08").value() == "sim") {
        form.fields("TP_PUB_EMPENHO09").visible(true)
        form.fields("AD_PUB_EMPENHO09").visible(true)
    }
    if (form.fields("AD_PUB_EMPENHO09").value() == "sim") {
        form.fields("TP_PUB_EMPENHO10").visible(true)
    }
    form.apply()
}

function zeraAprovacaoGrid() {
    var grid = form.grids("DOCUMENTOS");
    var total = grid.dataRows().length;
    console.log("LINHAS: " + total)
}

function seta_grid_t() {
    setTimeout(function () {
        seta_grid()
    }, 500);
}

function seta_grid() {
    var grid = form.grids("LISTA_PROCESSO");
    var total = grid.dataRows().length;
    if (total == 0) {
        var vlrFinal = 0;
        var lista = form.fields("LISTA_PGTOSS").value();
        lista = lista.replace(/(\r\n|\n|\r)/gm, "");
        var campo = lista.split(';');
        var palavras = lista.split(';').length;
        if (campo[0] != "") {
            for (i = 0; i < palavras; i += 3) {
                grid.insertDataRow({ NUPROCESSO: campo[i], SERVICO_GERAL: campo[i + 1], VL_SERVICO: campo[i + 2] });
                vlrFinal = vlrFinal + Number(campo[i + 2]);
            }
            // grid.actions('EDIT).hidden(true);
            form.grids('LISTA_PROCESSO').actions('EDIT').hidden(true);
            //grid.actions('EDIT).hidden(true);
            Form.fields('VL_TOTAL_NOTA').value(vlrFinal).apply();
        }
        form.apply();
    }
}

function zeraGridListaProcesso() {
    var grid = form.grids("LISTA_PROCESSO");
    var total = grid.dataRows().length;
    for (i = 0; i < total; i++) {
        grid.removeDataRow(grid.dataRows(i).id);
    }
    form.fields('VL_TOTAL_NOTA').value(0).apply();
}

function calculatotal_t() {
    setTimeout(function () {
        calculatotal()
    }, 1000);
}

function calculatotal() {
    var gridAPI = form.grids('LISTA_PROCESSO');
    var total = Number(gridAPI.dataRows().length);
    var lista = 0;
    if (total > 0) {
        lista = Number(gridAPI.dataRows(0).VL_SERVICO);
        for (i = 1; i < total; i++) {
            lista = lista + Number(gridAPI.dataRows(i).VL_SERVICO);
        }
    }
    form.fields('VL_TOTAL_NOTA').value(lista).apply();
}

function setarcampos_t() {
    setTimeout(function () {
        setarcampos()
    }, 1000);
}

function setarcampos() {
    form.fields("LISTA_OUTROS").actions("LISTA_OUTROS_refresh").execute()
    form.fields("LISTA_PGTOSS").actions("LISTA_PGTOSS_refresh").execute()
    form.fields("ENDERECO_CONTRATADA").actions("ENDERECO_CONTRATADA_refresh").execute()
    form.fields("NU_CONTRATO").actions("NU_CONTRATO_refresh").execute()
    form.fields("EMAIL_CONTRATADA").actions("EMAIL_CONTRATADA_refresh").execute()
    form.fields("TELEFONE_EMPRESA").actions("TELEFONE_EMPRESA_refresh").execute()
    form.fields("CNPJ_EMPRESA").actions("CNPJ_EMPRESA_refresh").execute()
    form.fields('SALDO_CONTRATO').value(0).apply();
    form.fields("SALDO_CONTRATO").actions("SALDO_CONTRATO_refresh").execute()
    form.fields("VL_CONTRATO").actions("VL_CONTRATO_refresh").execute()
    form.fields("Q_TEMPLATE").actions("Q_TEMPLATE_refresh").execute()

    form.fields('OBJETO_CONTRATO').value("").apply();
    form.fields('DATA_ASSINATURA').value("").apply();
    form.fields('DT_INICIO_ATIVIDADE').value("").apply();
    form.fields('DT_ALERTA_RENOVACAO').value("").apply();
    form.fields('DT_VIGENCIA').value("").apply();
    form.grids("DOCUMENTOS").fields("NUCONTRATO").value(form.fields("L_NOME_FORNECEDOR").value()).apply();


    form.fields("OBJETO_CONTRATO").actions("OBJETO_CONTRATO_refresh").execute()
    form.fields("DATA_ASSINATURA").actions("DATA_ASSINATURA_refresh").execute()
    form.fields("DT_INICIO_ATIVIDADE").actions("DT_INICIO_ATIVIDADE_refresh").execute()
    form.fields("DT_ALERTA_RENOVACAO").actions("DT_ALERTA_RENOVACAO_refresh").execute()
    form.fields("DT_VIGENCIA").actions("DT_VIGENCIA_refresh").execute()

    form.fields("PREPOSTO").actions("PREPOSTO_refresh").execute()
    form.fields("GESTOR_CONTRATO").actions("GESTOR_CONTRATO_refresh").execute()
    form.fields("FISCAL_ADM").actions("FISCAL_ADM_refresh").execute()

    zeraGridListaProcesso();
    form.fields('SALDO_CONTRATO').value("").apply();
    form.fields('VERIFICA_SERVICO').value("").apply();
}

function verificaContrato_t() {
    setTimeout(function () {
        verificaContrato()
    }, 1500);
}

function verificaContrato() {
    var grid = form.grids("LISTA_PROCESSO")
    var linhas = Number(grid.dataRows().length);
    var numContrato = form.fields("L_NOME_FORNECEDOR").value()
    if (linhas == 0) {
        form.addCustomModal({
            title: "ATENÇÃO",
            description: "O contrato " + numContrato + " não possui serviços disponíveis. Favor selecionar outro contrato.",
            showButtonClose: false,
            buttons: [{
                name: "Fechar",
                closeOnClick: true,
                action: function () {
                    form.fields("L_NOME_FORNECEDOR").value("")
                    form.fields("VERIFICA_SERVICO").disabled(true).value("")
                    $('.lean-overlay').css('display', 'none');
                    form.apply()
                }
            }]
        });
    }
}


function verificagridservico() {
    var erro = form.errors();
    var gridservico = form.grids("LISTA_PROCESSO");
    var linhas = Number(gridservico.dataRows().length);

    if (linhas == 0) {
        erro[gridservico.id] = ["É necessário ter serviços disponíveis para pagamento."]
    }
    form.errors(erro);
    form.apply();
}


function setartemplates_t() {
    setTimeout(function () {
        setartemplates()
    }, 500);
}

function setartemplates() {
    var lista = form.fields("Q_TEMPLATE").value();
    var amb = lista.split(';');
    var qnt = lista.split(';').length;
    if (lista != "" && lista != null) {
        form.fields("T_FGTS").value(amb[0]);
        form.fields("DT_FGTS").value(amb[1]);
        form.fields("T_REG_UNIAO").value(amb[2]);
        form.fields("DT_UNIAO").value(amb[3]);
        form.fields("T_DEBITOS_TRAB").value(amb[4]);
        form.fields("DT_TRAB").value(amb[5]);
        form.fields("TP_CONTRATO").value(amb[6]);
        form.fields("TP_NOTA_EMPENHO").value(amb[7]);
        form.fields("TP_COMPROVANTE_ENTREGA").value(amb[8]);
        form.fields("T_REQUISICAO_PGTO").value(amb[9]);
        form.fields("T_TERMO_REFERENCIA").value(amb[10]);
        form.fields("T_EXTRATO_CONTRATO").value(amb[11]);
        form.fields("T_CNPJ").value(amb[12]);
        form.fields("TP_MAPA_CONTROLE").value(amb[13]);
        form.fields("TP_COMPROVANTE_ATO").value(amb[14]);
        form.fields("TP_INCORPORACAO_BEM").value(amb[15]);
        form.fields("TP_PARECER_FISC").value(amb[16]);
        form.fields("TP_SIGFIS").value(amb[17]);
        form.fields("TP_DESPACHO_CONTABIL").value(amb[18]);
        form.fields("TP_MEMORIA_CALCULO").value(amb[19]);
        form.fields("TP_SOLIC_COMPRAS").value(amb[20]);
        form.fields("TP_TERMO_FOMENTO").value(amb[21]);
        form.fields("TP_ATO_CONSTITUTIVO").value(amb[22]);
        form.fields("TP_PUB_EXTR_FOMENTO").value(amb[23]);
        form.fields("TP_IND_RECUR_ORC").value(amb[24]);
        form.fields("TP_ATA_REG_PRECO").value(amb[25]);
        form.fields("TP_PUB_ATA_REG_PRECO").value(amb[26]);
        form.fields("TP_CONTROLE_QUANT").value(amb[27]);
        form.apply();
    }
}

function zeragriddoc_tempo() {
    setTimeout(function () {
        zeragriddoc()
    }, 1000);
}

function zeragriddoc() {
    var grids = form.grids("DOCUMENTOS");
    var total = grids.dataRows().length;
    for (i = 0; i < total; i++) {
        grids.removeDataRow(grids.dataRows(i).id);
    }
    form.apply();
}


function setartiponota() {
    var gdLista = form.grids("LISTA_PROCESSO")
    gdLista.actions('DESTROY').hidden(true).apply();
    if (form.fields("TIPO_NOTA").value() == "Nota Individual") {
        gdLista.fields("NUPROCESSO").setRequired('aprovar', false).apply();

        gdLista.fields("NU_NOTA_FISCAL_M").readOnly(true).setRequired('aprovar', false)
        gdLista.fields("T_NOTA_FISCAL_M").readOnly(true).setRequired('aprovar', false)
        gdLista.fields("DT_EMISSAO_NF_M").readOnly(true).setRequired('aprovar', false)
        gdLista.fields("DT_VENCIMENTO_NF_M").readOnly(true).setRequired('aprovar', false)

        form.fields('L_ANEXAR_NOTA_FISCAL').visible(true)
        form.fields('L_SERVICO_GERAL_I').visible(true).setRequired('aprovar', true)
        form.fields('NU_NOTA_FISCAL').visible(true).setRequired('aprovar', true)
        form.fields('T_NOTA_FISCAL').visible(true).setRequired('aprovar', true)
        form.fields('DT_EMISSAO_NF').visible(true).setRequired('aprovar', true)
        form.fields('DT_VENCIMENTO_NF').visible(true).setRequired('aprovar', true)
        zeragridnotafiscal();

    } else {
        form.grids('LISTA_PROCESSO').actions('CREATE').hidden(true)
        gdLista.fields("NUPROCESSO").setRequired('aprovar', true)

        gdLista.fields("NU_NOTA_FISCAL_M").readOnly(false).setRequired('aprovar', true)
        gdLista.fields("T_NOTA_FISCAL_M").readOnly(false).setRequired('aprovar', true)
        gdLista.fields("DT_EMISSAO_NF_M").readOnly(false).setRequired('aprovar', true)
        gdLista.fields("DT_VENCIMENTO_NF_M").readOnly(false).setRequired('aprovar', true)

        form.fields('L_ANEXAR_NOTA_FISCAL').visible(false)
        form.fields('L_SERVICO_GERAL_I').visible(false).setRequired('aprovar', false).value("")
        form.fields('NU_NOTA_FISCAL').visible(false).setRequired('aprovar', false).value("")
        form.fields('T_NOTA_FISCAL').visible(false).setRequired('aprovar', false).value("")
        form.fields('DT_EMISSAO_NF').visible(false).setRequired('aprovar', false).value("")
        form.fields('DT_VENCIMENTO_NF').visible(false).setRequired('aprovar', false).value("")
    }
    form.apply()
}

function zeragridnotafiscal() {
    var gridAPI = form.grids('LISTA_PROCESSO');
    var total = Number(gridAPI.dataRows().length);
    for (i = 0; i < total; i++) {
        gridAPI.updateDataRow({
            id: i + 1, NU_NOTA_FISCAL_M: ""
        });

        gridAPI.updateDataRow({
            id: i + 1, T_NOTA_FISCAL_M: ""
        });

        gridAPI.updateDataRow({
            id: i + 1, DT_EMISSAO_NF_M: ""
        });

        gridAPI.updateDataRow({
            id: i + 1, DT_VENCIMENTO_NF_M: ""
        });
        form.apply();
    }
}

function verificavaziogrid() {
    var erro = form.errors();
    var gridAPI = form.grids("LISTA_PROCESSO");
    var total = Number(gridAPI.dataRows().length);

    for (i = 0; i < total; i++) {
        if (gridAPI.dataRows(i).NU_NOTA_FISCAL_M == "" || gridAPI.dataRows(i).T_NOTA_FISCAL_M == "" || gridAPI.dataRows(i).DT_EMISSAO_NF_M == "" || gridAPI.dataRows(i).DT_VENCIMENTO_NF_M == "") {
            erro[gridAPI.id] = ["Todas as notas devem ser preenchidas."]
        }
    }
    form.errors(erro);
    form.apply();
}

function validadata() {
    var erro = form.errors();
    var dt_fgts = form.fields("DT_FGTS");
    var dt_uniao = form.fields("DT_UNIAO");
    var dt_trab = form.fields("DT_TRAB");
    var sysdate = form.fields("SYSDATE").value();

    if (dt_fgts.value() < sysdate) {
        erro[dt_fgts.id] = ["A certidão está vencida."]
    }

    if (dt_uniao.value() < sysdate) {
        erro[dt_uniao.id] = ["A certidão está vencida."]
    }

    if (dt_trab.value() < sysdate) {
        erro[dt_trab.id] = ["A certidão está vencida."]
    }
    form.errors(erro);
    form.apply();
}

function arrumaData(data) {
    var aux = data;
    var n = aux.search("/");
    if (n > 0) {
        var dia = new Array(aux.split('/', 1));
        var mes = aux.substring(3, 5);
        var ano = aux.substring(6, 10);

    } else {
        var ano = new Array(aux.split('-', 1));
        var mes = aux.substring(5, 7);
        var dia = aux.substring(8, 10);
    }
    var data = new Date(dia + '/' + mes + '/' + ano);
    return (data);
}

function seta_gridoutros() {
    var grid = form.grids("DOCUMENTOS");
    var total = grid.dataRows().length;
    var vlrTotal = 0;
    var vlrFinal = 0;

    console.log("RODANDO")
    if (total < 1) {
        console.log("ENTROU IF")
        var lista = form.fields("LISTA_OUTROS").value();
        lista = lista.replace(/(\r\n|\n|\r)/gm, "");
        var campo = lista.split(';');
        var palavras = lista.split(';').length;
        if (campo[0] != "") {
            for (i = 0; i < palavras; i += 3) {
                grid.insertDataRow({
                    NUCONTRATO: campo[i],
                    DESC_DOCUMENTO: campo[i + 1],
                    T_DOC: campo[i + 2]
                });
            }
        }
    } else {
        console.log("ENTROU ELSE")
    }
    form.apply();
}

function verifica_gridsanar() {
    var erro = form.errors();
    var gridAPI = form.grids("DOCUMENTOS");
    var total = Number(gridAPI.dataRows().length);
    for (i = 0; i < total; i++) {
        if (gridAPI.dataRows(i).T_DOC == null || gridAPI.dataRows(i).T_DOC == "") {
            erro[gridAPI.id] = ["Todos os documentos precisam ser anexados."]
        }
    }
    form.errors(erro);
    form.apply();
}

function verificatemoutros() {
    var gridAPI = form.grids("DOCUMENTOS");
    var total = Number(gridAPI.dataRows().length);
    form.fields('TEM_OUTROS').value("").apply();
    //alert(total);
    if (total > 0) {
        //alert("entrou");
        form.fields('TEM_OUTROS').value("Sim").apply();
    }
    form.apply();
}