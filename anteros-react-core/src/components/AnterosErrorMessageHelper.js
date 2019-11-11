export function processErrorMessage(error) {
	var msgErro = "";
	if (error.response && error.response.data && error.response.data.apierror) {
		msgErro = error.response.data.apierror.message;
		if (error.response.data.apierror.subErrors) {
			msgErro = [];
			error.response.data.apierror.subErrors.forEach(element => {
				msgErro.push(element.message);
			});
		}
	} else {
		if (
			error.response &&
			error.response.status &&
			error.response.status == 404
		) {
			msgErro =
				"Recurso não encontrado no servidor ou a url está incorreta. Erro 404";
		} else if (error.response && error.response.data) {
			msgErro = error.response.data;
		} else if (error.response) {
			msgErro = error.response;
		} else {
			if (error.message && error.message === "Network Error") {
				msgErro = "Servidor não disponível ou algum problema na rede.";
			} else {
				msgErro = error.message;
			}
		}
	}
	return msgErro;
}

export function processDetailErrorMessage(error) {
	var msgErro = "";
	if (error.response && error.response.data && error.response.data.apierror) {
		msgErro = error.response.data.apierror.debugMessage;
	}
	return msgErro;
}
