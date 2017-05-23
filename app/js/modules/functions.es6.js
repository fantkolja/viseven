/**
 * Created by Mykola.Fant on 23.05.2017.
 */
export function $(selector, parent = document){
	return parent.querySelector(selector);
}