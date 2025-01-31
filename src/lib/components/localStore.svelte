<script module>
  import { browser } from '$app/environment';

  export class LocalStore {
    value = $state(null)
    #key = ''

    constructor(key, value) {
      this.#key = key;
      this.value = value;

      if(browser) {
        const item = localStorage.getItem(key);
        if(typeof item !== 'undefined') {
          this.value = this.deserialize(item);
        } else {
          this.value = '';
        }
      }

      $effect(() => {
        localStorage.setItem(this.key, this.serialize(this.value));
      });
    }

    get key() {
      return this.#key;
    }

    serialize(value) {
      return JSON.stringify(value);
    }

    deserialize(value) {
      return JSON.parse(value);
    }

    expireLocalStore() {
      localStorage.removeItem(this.key);
    }
  }

  export function localStore(key, value) {
    return new LocalStore(key, value);
  }
</script>