import React, { Component } from 'react';


export default class AnterosNotFound extends Component {
    render() {
        return (
            <div className="nb-error">
                <div className="error-code">404</div>
                <h3 className="font-bold">Nós não conseguimos encontrar a página..</h3>

                <div className="error-desc">
                Desculpe, mas a página que você está procurando não foi encontrada ou não existe. <br />
                    Tente atualizar a página ou clique no botão abaixo para voltar à página inicial.
          <div className="input-group">
                        <input type="text" placeholder="Try with a search" className="form-control" />
                        <span className="input-group-btn">
                            <button type="button" className="btn btn-default">
                                <em className="fa fa-search"></em>
                            </button>
                        </span>
                    </div>                    
                </div>
            </div>
        )
    }
}
