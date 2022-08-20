"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDetailErrorMessage = exports.processErrorMessage = void 0;
function processErrorMessage(error) {
    var msgErro = "";
    if (error.response && error.response.data && error.response.data.apierror) {
        msgErro = error.response.data.apierror.message;
        if (error.response.data.apierror.subErrors) {
            msgErro = [];
            error.response.data.apierror.subErrors.forEach((element) => {
                msgErro.push(element.message + " (" + element.object + ")");
            });
        }
    }
    else {
        if (error.response &&
            error.response.status &&
            error.response.status === 404) {
            msgErro =
                "Recurso não encontrado no servidor ou a url está incorreta. Erro 404";
        }
        else if (error.response &&
            error.response.status &&
            error.response.status === 401) {
            msgErro = "Usuário/senha inválido.";
        }
        else if (error.response &&
            error.response.status &&
            error.response.status === 405) {
            msgErro =
                "Método não permitido no servidor ou a url está incorreta. Erro 405";
        }
        else if (error.response &&
            error.response.status &&
            error.response.status === 400) {
            msgErro = "Requisição incorreta. Erro 400";
        }
        else if (error.response && error.response.data) {
            msgErro = error.response.data;
        }
        else if (error.response) {
            msgErro = error.response;
        }
        else {
            if (error.message && error.message === "Network Error") {
                msgErro = "Servidor não disponível ou algum problema na rede.";
            }
            else {
                msgErro = error.message ? error.message : error;
            }
        }
    }
    if (typeof msgErro === "object") {
        if (error &&
            (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
            msgErro = "Servidor não disponível ou algum problema na rede.";
        }
    }
    return msgErro + "";
}
exports.processErrorMessage = processErrorMessage;
function processDetailErrorMessage(error) {
    var msgErro = "";
    if (error.response && error.response.data && error.response.data.apierror) {
        msgErro = error.response.data.apierror.debugMessage;
    }
    return msgErro + "";
}
exports.processDetailErrorMessage = processDetailErrorMessage;
//# sourceMappingURL=AnterosErrorMessageHelper.js.map