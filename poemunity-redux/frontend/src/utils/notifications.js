import toastr from 'toastr';
import 'toastr/toastr.scss';

const BASE_CONFIG = {
    closeButton: false,
    debug: false,
    newestOnTop: true,
    progressBar: false,
    positionClass: 'toast-bottom-right',
    preventDuplicates: true,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
};

/**
 *
 * @param message {string} Message to be displayed in the body
 * @param title {string} Message to be displayed in the title
 * @returns {*}
 */
export function manageWarning(message, title = undefined) {
    toastr.options = BASE_CONFIG;
    return toastr.warn(message, title);
}

/**
 *
 * @param message {string} Message to be displayed in the body
 * @param title {string} Message to be displayed in the title
 * @returns {*}
 */
export function manageError(message, title = undefined) {
    toastr.options = BASE_CONFIG;
    return toastr.error(message, title);
}

/**
 *
 * @param message {string} Message to be displayed in the body
 * @param title {string} Message to be displayed in the title
 * @returns {*}
 */
export function manageSuccess(message, title = undefined) {
    toastr.options = BASE_CONFIG;
    return toastr.success(message, title);
}
