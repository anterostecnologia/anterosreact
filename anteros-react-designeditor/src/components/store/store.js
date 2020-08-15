
import { configure } from 'mobx';
import DesignState from './DesignState';

configure({ enforceActions: 'observed' });

class RootStore {


  constructor() {
    this.DesignState = new DesignState({ rootStore: this });
  }
}

export default new RootStore();
