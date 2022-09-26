declare namespace wasm_bindgen {
	/* tslint:disable */
	/* eslint-disable */
	/**
	*/
	export function init_hook(): void;
	/**
	* @param {any} number
	* @param {any} network
	*/
	export function add_car(number: any, network: any): void;
	/**
	* @param {any} number
	* @param {any} inputs
	* @returns {any}
	*/
	export function feed_forward_car_no(number: any, inputs: any): any;
	/**
	* @param {any} number
	*/
	export function test_send_array(number: any): void;
	/**
	* @param {any} number
	*/
	export function test_send_array_array(number: any): void;
	/**
	* @param {any} number
	*/
	export function test_send_struct(number: any): void;
	
}

declare type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

declare interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly add_car: (a: number, b: number) => void;
  readonly feed_forward_car_no: (a: number, b: number) => number;
  readonly test_send_array: (a: number) => void;
  readonly test_send_array_array: (a: number) => void;
  readonly test_send_struct: (a: number) => void;
  readonly init_hook: () => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
declare function wasm_bindgen (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
