import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { autoBind, AnterosClickOutside } from '@anterostecnologia/anteros-react-core'
import { AnterosText } from '@anterostecnologia/anteros-react-label';
import { AnterosIcon } from '@anterostecnologia/anteros-react-image';
import lodash from 'lodash';
import { AnterosScrollbars } from '@anterostecnologia/anteros-react-containers';
import shallowCompare from 'react-addons-shallow-compare';

export class AnterosMegaMenu extends Component {
  constructor(props) {
    super(props)
    
    if (this.props.onChangeMenuFormat) {
      this.props.onChangeMenuFormat(this.props.menuOpened);
    }
    autoBind(this);

    let favorites = [];
    if (this.props.getFavorites) {
      let _favorites=props.getFavorites();
      _favorites.forEach(id=>{
      let it = this.getItem(id, this.props);
        favorites.push(it);
      })
    } else {
      favorites = this.props.favorites?this.props.favorites:[];
    }
    this.state = {
      selectedItem: [], menuOpened: this.props.menuOpened,
      filteredItens: [], favorites: favorites, onlyFavorites: false
    };
  }

  onSelectedItem(item) {
    if (item.props.children && React.Children.toArray(item.props.children).length > 0) {
      let selectedItem = this.state.selectedItem;
      selectedItem.push(item);
      let mainItem;
      let subItem;
      if (this.itemIsMainLevel(item)) {
        mainItem = item;
        selectedItem = [item];
      } else {
        subItem = item;
      }
      this.setState({ ...this.state, selectedItem, selectedMainItem: mainItem, selectedSubItem: subItem });
    } else {
      if (this.itemIsMainLevel(item)) {
        let mainItem = item;
        let selectedItem = [];
        this.setState({ ...this.state, selectedItem, selectedMainItem: mainItem },()=>{
          this.closeMenu();
        });
      } else {
        let subItem = item;
        this.setState({ ...this.state, selectedSubItem: subItem },()=>{
          this.closeMenu();
        });
      }
    }
  }

  itemIsMainLevel(item) {
    const children = React.Children.toArray(this.props.children);
    let found = false;
    children.forEach(function (it) {
      if (item.props.id === it.props.id) {
        found = true;
      }
    });
    return found;
  }

  unstack(event) {
    let desempilhado = this.state.selectedItem;
    desempilhado.pop();
    this.setState({ ...this.state, selectedItem: desempilhado })
  }

  getChildContext() {
    return {
      onSelectedItem: this.onSelectedItem,
      unstack: this.unstack,
      selectedMainItem: this.state.selectedMainItem,
      selectedSubItem: this.state.selectedSubItem,
      menuOpened: this.state.menuOpened,
      onClickFavorite: this.onClickFavorite,
      favorites: this.state.favorites
    };
  }
  onClickFavorite(item, event) {
    let it = this.getItem(item.props.id, this.props);
    let favorites = this.state.favorites;
    let found = false;
    let indexFound = -1;
    if (this.state.favorites){
      this.state.favorites.forEach((favItem,index)=>{
        if (favItem.props.id === item.props.id){
            found = true;
            indexFound = index;
        }
      })
    }
    if (found) {
      favorites.splice(indexFound, 1);
    } else {
      favorites.push(it);
    }
    let favoritesList = [];
    favorites.forEach(item=>{
      favoritesList.push(item.props.id);
    })
    event.stopPropagation();
    this.props.onChangeFavorites&&this.props.onChangeFavorites(favoritesList);
    this.setState({ ...this.state, favorites })
  }

  getItem(id, props) {
    let arrayChildren = React.Children.toArray(props.children);
    for (let index = 0; index < arrayChildren.length; index++) {
      const element = arrayChildren[index];
      if (element.props.children) {
        let result = this.getItem(id, element.props);
        if (result)
          return result;
      } else {
        if (element.props.id === id) {
          return element;
        }
      }
    }
  }

  onMouseEnter(event) {
    if (!this.state.menuOpened) {
      let _this = this;
      this.setState({ ...this.state, menuOpened: true });

      if (this.props.onChangeMenuFormat) {
        this.props.onChangeMenuFormat(true);
      }
      setTimeout(() => {
        if (_this.props.onExpandMenu) {
          _this.props.onExpandMenu();
        }
      }, 300);
    }


  }

  onMouseLeave(event) {
    this.closeMenu();
  }

  closeMenu(){
    if (this.state.menuOpened) {
      let _this = this;
      this.setState({ ...this.state, menuOpened: false });

      if (this.props.onChangeMenuFormat) {
        this.props.onChangeMenuFormat(false);
      }
      setTimeout(() => {
        if (_this.props.onCollapseMenu) {
          _this.props.onCollapseMenu();
        }
      }, 300);
    }
  }

  onClickOutside(event) {
    this.closeMenu();
  }

  onFilterChange(filter) {
    let itens;
    if (filter === '' || filter === undefined) {
      itens = [];
    } else {
      itens = this.filterItems(this, filter);
    }
    this.setState({ ...this.state, filteredItens: itens, selectedItem: [], selectedMainItem: undefined, selectedSubItem: undefined });
  }

  onClickOnlyFavorites(item) {
    this.setState({ ...this.state, onlyFavorites: !this.state.onlyFavorites });
  }

  filterItems(item, filter) {
    let result = [];
    let arrayChildren = React.Children.toArray(item.props.children);
    for (let element in arrayChildren) {
      if (element.props.children) {
        result = result.concat(this.filterItems(element, filter));
      } else {
        if (new RegExp(filter, 'i').test(element.props.caption)) {
          result.push(element);
        }
      }
    }
    return result;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    let style = {};
    if (this.props.withoutUserBlock) {
      style = { top: '101px' };
    }
    return (
      <AnterosClickOutside onClickOutside={this.onClickOutside}>
        <div className="mmenu-main" style={style} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          <AnterosScrollbars
            className="app-scroll"
            autoHide
            autoHideDuration={100}
          >
            <AnterosMegaMenuTop menuOpened={this.state.menuOpened}
              onFilterChange={this.onFilterChange}
              onlyFavorites={this.state.onlyFavorites}
              onClickOnlyFavorites={this.onClickOnlyFavorites}
              caption={this.state.selectedItem.length > 0 ? this.state.selectedItem[this.state.selectedItem.length - 1].props.caption : "Menu"} />
            <AnterosMegaMenuNav menuOpened={this.state.menuOpened} >
              {this.state.filteredItens.length > 0 || this.state.onlyFavorites ?
                <MainMenuFilteredView favorites={this.state.favorites}>
                  {this.state.onlyFavorites ? this.state.favorites : this.state.filteredItens}
                </MainMenuFilteredView>
                :
                <MainMenuView favorites={this.state.favorites}>
                  {this.props.children}
                </MainMenuView>
              }
              {!this.state.onlyFavorites && this.state.filteredItens.length === 0 && this.state.menuOpened && this.state.selectedItem.length > 0 && this.state.selectedItem[this.state.selectedItem.length - 1].props.children ?
                <SubMenuView hasItens={this.state.selectedItem.length > 0} favorites={this.state.favorites}>
                  {this.state.selectedItem[this.state.selectedItem.length - 1].props.children}
                </SubMenuView>
                : <SubMenuView className='mmenu-sub-menu' selectedItens={this.state.selectedItem} />}
            </AnterosMegaMenuNav>
          </AnterosScrollbars>
          <div class="mmenu-footer">
            {this.props.version}
          </div>
        </div>
      </AnterosClickOutside>
    );
  }
}

AnterosMegaMenu.propTypes = {
  menuOpened: PropTypes.bool.isRequired,
}
AnterosMegaMenu.defaultProps = {
  menuOpened: false
}

AnterosMegaMenu.childContextTypes = {
  onSelectedItem: PropTypes.func,
  selectedMainItem: PropTypes.object,
  selectedSubItem: PropTypes.object,
  onClickFavorite: PropTypes.func,
  menuOpened: PropTypes.bool,
  unstack: PropTypes.func,
  favorites: PropTypes.array
}

class AnterosMegaMenuTop extends Component {
  constructor(props) {
    super(props)
    autoBind(this);
    this.state = { selectedItem: undefined, filter: undefined }
  }

  unstack(event) {
    this.context.unstack(this);
  }

  onChangeFilter(event) {
    this.setState({ ...this.state, filter: event.target.value });
    if (this.props.onFilterChange) {
      this.props.onFilterChange(event.target.value);
    }
  }

  onClickOnlyFavorites(event) {
    if (this.props.onClickOnlyFavorites) {
      this.props.onClickOnlyFavorites(this);
    }
  }

  onClearSearch(event) {
    this.setState({ ...this.state, filter: '' });
    if (this.props.onFilterChange) {
      this.props.onFilterChange(undefined);
    }
  }

  render() {
    let width = "350px";
    if (!this.props.menuOpened) {
      width = "60px";
    }
    let selected = this.props.onlyFavorites ? { color: '#ffea00' } : {};
    return (
      <div className='mmenu-top-container' style={{ width: width }}>
        <div className='mmenu-top-filter'>
          {!this.props.menuOpened ?
            <div className='mmenu-caption mmenu-list-item-text' >
              <i className={`far fa-search mmenu-item-icone mmenu-icon`}></i>
            </div>
            : <div className='mmenu-top-search-field'>
              <div className='mmenu-top-search-field-input'>
                <input className='mmenu-top-search-input'
                  type="text" autoComplete='off'
                  onChange={this.onChangeFilter}
                  value={this.state.filter}
                  placeholder='Procurar' />
                <span id="box_icone_busca">
                  <i id="icone_busca" class="fa fa-times" onClick={this.onClearSearch}></i>
                </span>
                <button className='mmenu-btn mm-btn_close mmenu-searchfield-btn mmenu-hidden' href="#">Cancelar</button>
              </div>
            </div>}
        </div>
        <div className='mmenu-top-filter'>
          {this.props.menuOpened ?
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <a href="#1" className={this.props.caption === "Menu" ? 'mmenu-visible-btn' : 'fa fa-chevron-left mmenu-btn mmenu-btn-prev mmenu-navbar-btn'} onClick={this.unstack} >
                <i className='fa fa-chevron-left mmenu-btn-return-item mmenu-icon'></i>
              </a>
              <span className='mmenu-top-caption'>{this.props.caption}</span>
              <AnterosIcon icon="mmenu-main-favorite fas fa-star" style={selected} onClick={this.onClickOnlyFavorites} />
            </div>
            :
            <AnterosIcon icon="mmenu-caption mmenu-list-item-text mmenu-main-favorite fas fa-star" style={selected} onClick={this.onClickOnlyFavorites} />}
        </div>
      </div>
    )
  }
}
AnterosMegaMenuTop.contextTypes = {
  unstack: PropTypes.func,
};

class AnterosMegaMenuNav extends Component {
  constructor(props) {
    super(props)
    autoBind(this);
  }

  render() {
    let width = "350px";
    if (!this.props.menuOpened) {
      width = "60px";
    }
    return (
      <nav className='mmenu-container-nav-menu mmenu-container' style={{ width: width }}>
        <div className='menu-painel'>
          <ul className='mmenu-listview'>
            {this.props.children[0]}
          </ul>
          {this.props.children[1]}
        </div>
      </nav>
    )
  }
}

export class MainMenuView extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

export class SubMenuView extends Component {
  render() {
    return (
      <div className={this.props.hasItens ? `mmenu-item-open` : `mmenu-sub-menu`}>
        {this.props.children}
      </div>
    )
  }
}

export class AnterosMegaMenuItem extends Component {
  constructor(props, context) {
    super(props)
    this.idItem = this.props.id?this.props.id:lodash.uniqueId("li");
    autoBind(this);
  }

  onSelectedItem(event) {
    if (this.props.onSelectMenuItem) {
      this.props.onSelectMenuItem(this);
    }
    this.context.onSelectedItem(this);
  }

  onClickFavorite(event) {
    this.context.onClickFavorite(this, event);
    event.stopPropagation();
  }

  isFavorite() {
    let _this = this;
    let favorite = false;
    if (this.context.favorites && this.context.favorites.length > 0) {
      this.context.favorites.forEach(function (item) {
        if (item.props.caption === _this.props.caption) {
          favorite = true;
        }
      });
    }
    return favorite;
  }

  getCountVisibleChildren(children){
    let result = 0;
    children.forEach(function(item){
      if (item.props.visible){
        result++;
      }
    });
    return result;
  }

  render() {
    if (this.props.visible===false){
      return (null);
    }
    const children = React.Children.toArray(this.props.children);
    const itensCount = this.getCountVisibleChildren(children);
    let className = 'mmenu-item';
    if (this.context.selectedMainItem === this || this.context.selectedSubItem === this) {
      className = 'mmenu-item-selected';
    }
    let selected = this.isFavorite() ? { color: '#ffea00' } : {};
    let classNameSelected = this.isFavorite() ? "fas fa-star mmenu-favorite-icon":"far fa-star mmenu-favorite-icon";
    return (
      <li id={this.idItem} className={className} onClick={this.onSelectedItem}>
        <div className='mmenu-caption mmenu-list-item-text' style={this.props.style}
          data-placement={this.props.hintPosition}
          data-balloon-pos={this.props.hintPosition} aria-label={this.props.hint}>
          {this.props.icon?<i className={`${this.props.icon} mmenu-item-icone mmenu-icon`}></i>:<img src={this.props.image} className={`mmenu-item-icone mmenu-icon`}></img>}
          {this.context.menuOpened ?
            <AnterosText truncate={true} text={this.props.caption} style={{ cursor: 'pointer', paddingLeft: "5px" }} />
            : null}
        </div>
        {itensCount > 0 && this.context.menuOpened ?
          <div className='mmenu-count-arrow' >
            <span className='mmenu-count-children' >{itensCount}</span>
            <i className='mmenu-icon-chevron fa fa-chevron-right' />
          </div> : null}
        {itensCount === 0 && this.context.menuOpened ?
          <div tabIndex="-1" className='mmenu-favorite' data-placement={this.props.hintPosition}
            data-balloon-pos={this.props.hintPosition} aria-label={this.props.hint}>
            <i className={classNameSelected} style={selected} onClick={this.onClickFavorite} />
          </div> : null}
      </li>
    )
  }
}
AnterosMegaMenuItem.contextTypes = {
  onSelectedItem: PropTypes.func,
  selectedMainItem: PropTypes.object,
  selectedSubItem: PropTypes.object,
  menuOpened: PropTypes.bool,
  onClickFavorite: PropTypes.func,
  favorites: PropTypes.array,
  visible: PropTypes.bool.isRequired
};

AnterosMegaMenuItem.propTypes = {
  hint: PropTypes.string,
  /** Posição da dica(hint) no botão */
  hintPosition: PropTypes.oneOf(["up", "right", "left", "down"]),
  visible: true
};

AnterosMegaMenuItem.defaultProps = {
  hintPosition: PropTypes.oneOf(["right"]),
};


class MainMenuFilteredView extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    return (<div>
      {this.props.children}
    </div>);
  }
}

export class AnterosMegaMenuDivider extends Component {
  render() {
    return (
      <div className='mmenu-divider'>{this.props.caption}</div>
    );
  }
}
