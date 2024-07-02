import API from './axiosInstance'
// import { LogLevels, trackError }   from 'utils/errorUtils';
// import { isProduction, isStaging } from 'constants/environments';
// import { navigateToLanding }       from 'utils/navigationManager';
import { manageError } from '../../utils/notifications'
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'
import { AppDispatch } from '../store'

// const allowedErrorConfig = [
//     {
//         requestUrl: '/config',
//         requestMethod: 'get',
//         errorMessage: 'Network Error',
//         requestLocation: '/',
//     },
//     {
//         requestUrl: '/pay',
//         requestMethod: 'post',
//     },
// ];

// const untrackedErrors = [
//     {
//         requestUrl: '/host/leds',
//         requestMethod: 'post',
//     },
//     {
//         requestUrl: '/models/predict',
//         requestMethod: 'get',
//     },
// ];

// function manageError(error, proceed) {
//     if (error?.name === 'TypeError') {
//         console.error(error.stack);
//         throw error;
//     }
//     const { config: { url, method }, message } = error.toJSON();
//     const isAllowed = allowedErrorConfig.some((conf) => {
//         const allowedMethod = conf.requestMethod === method;
//         const allowedMessage = conf.errorMessage ? conf.errorMessage === message : true;
//         const allowedPath = url.endsWith(conf.requestUrl);
//         const allowedLocation = conf.requestLocation ? conf.requestLocation === window.location.pathname : true;
//         return allowedMethod && allowedMessage && allowedPath && allowedLocation;
//     });
//     const status = error?.response?.status || 500;
//     if (!isAllowed && status === 500) {
//         navigateToLanding();
//     } else {
//         proceed();
//     }
// }

// function actionTrackError(data) {
//     const { config: { url, method }, message } = data?.error?.toJSON();
//     const ignored = untrackedErrors.some((conf) => {
//         const allowedMethod = conf.requestMethod === method;
//         const allowedMessage = conf.errorMessage ? conf.errorMessage === message : true;
//         const allowedPath = url.endsWith(conf.requestUrl);
//         const allowedLocation = conf.requestLocation ? conf.requestLocation === window.location.pathname : true;
//         return allowedMethod && allowedMessage && allowedPath && allowedLocation;
//     });
//     const status = data.error?.response?.status || 500;
//     const error = data.error?.response || data.error;
//     if (status !== 500) {
//         console.error(data.error);
//         console.error(data.error.stack);
//         console.error(data.error.response?.data);
//         if (!ignored) {
//             if (isProduction || isStaging) {
//                 data.error = error;
//                 trackError(data);
//             } else {
//                 console.info('Tracking error prevented, not in production environment.');
//                 console.error(data);
//             }
//         } else {
//             console.info('Error tracking disabled for the following error.');
//             console.error(data);
//         }
//     } else {
//         data.logLevel = LogLevels.ERROR;
//         trackError(data);
//     }
// }

export function getTypes(baseType: string | undefined) {
  return {
    requestAction: `${baseType}_request`,
    fulfilledAction: `${baseType}_fulfilled`,
    rejectedAction: `${baseType}_rejected`,
    resetAction: `${baseType}_reset`
    // updateAction: `${baseType}_update`,
  }
}

interface GetActionProps {
  type: string
  url: string
  params?: unknown
  dispatch: AppDispatch
  options?: ReduxOptions
  callbacks?: ReduxCallbacks
  extraConfig?: object
}

export function getAction({
  type,
  url,
  params,
  dispatch,
  options = { reset: false, update: false, fetch: true },
  callbacks,
  extraConfig = {}
}: GetActionProps) {
  const {
    requestAction,
    fulfilledAction,
    rejectedAction,
    resetAction
    // updateAction is used with commonListReducers, but with commonReducer is not used for now
    // updateAction,
  } = getTypes(type)
  options.reset = options.reset !== undefined ? options.reset : false
  options.update = options.update !== undefined ? options.update : false
  options.fetch = options.fetch !== undefined ? options.fetch : true
  const { transformResponse } = options
  if (options.reset) {
    dispatch({ type: resetAction })
    if (callbacks?.reset) {
      callbacks.reset()
    }
  }
  if (options.fetch) {
    dispatch({ type: requestAction })
    API({}, extraConfig)
      .get(url, { params })
      .then((response) => {
        let responseData = response.data
        if (transformResponse && typeof transformResponse === 'function') {
          responseData = transformResponse(responseData)
        }
        // if (options.update) {
        //     dispatch({
        //         type: updateAction,
        //         payload: responseData,
        //     });
        // } else {
        dispatch({
          type: fulfilledAction,
          payload: responseData
        })
        // }
        if (callbacks?.success) {
          callbacks.success(responseData)
        }
      })
      .catch((error) => {
        dispatch({
          type: rejectedAction,
          // if there's a network error, for example, we don't get a response in error
          payload: error?.response?.data || error
        })
        manageError(error)
        if (callbacks?.error) {
          callbacks.error(error?.response?.data || error)
        }
        // manageError(error, () => {
        //     if (callbacks.error) {
        //         callbacks.error(error?.response?.data || error);
        //     }
        // });
        // actionTrackError({
        //     logLevel: LogLevels.INFO,
        //     extraData: {
        //         type,
        //         url,
        //         params,
        //         options,
        //     },
        //     error,
        // });
      })
  }
}

interface PostActionProps {
  type: string
  url: string
  data: object
  dispatch: AppDispatch
  options?: ReduxOptions
  callbacks?: ReduxCallbacks
  headers?: object
  config?: object
}

export function postAction({
  type,
  url,
  data,
  dispatch,
  options = { reset: false, update: false, fetch: true },
  callbacks,
  headers = {},
  config
}: PostActionProps) {
  const {
    requestAction,
    fulfilledAction,
    rejectedAction,
    resetAction
    // updateAction,
  } = getTypes(type)
  // default data
  options.reset = options.reset !== undefined ? options.reset : false
  options.update = options.update !== undefined ? options.update : false
  options.fetch = options.fetch !== undefined ? options.fetch : true

  // initialize logic
  if (options.reset) {
    dispatch({ type: resetAction })
    if (callbacks?.reset) {
      callbacks.reset()
    }
  }
  if (options.fetch) {
    dispatch({ type: requestAction })
    API(headers, config)
      .post(url, data)
      .then((response) => {
        // if (options.update) {
        //     dispatch({
        //         type: updateAction,
        //         payload: response.data,
        //     });
        // } else {
        dispatch({
          type: fulfilledAction,
          payload: response.data
        })
        // }
        if (callbacks?.success) {
          callbacks.success(response.data)
        }
      })
      .catch((error) => {
        dispatch({
          type: rejectedAction,
          payload: error?.response?.data || error
        })
        manageError(error)
        if (callbacks?.error) {
          callbacks.error(error?.response?.data || error)
        }
        // manageError(error, () => {
        //     if (callbacks.error) {
        //         callbacks.error(error?.response?.data || error);
        //     }
        // });
        // actionTrackError({
        //     logLevel: LogLevels.INFO,
        //     extraData: {
        //         type,
        //         url,
        //         data,
        //         options,
        //     },
        //     error,
        // });
      })
  }
}

interface PutActionProps {
  type: string
  url: string
  data?: object
  dispatch: AppDispatch
  options?: ReduxOptions
  callbacks?: ReduxCallbacks
  config?: object
}

export function putAction({
  type,
  url,
  data,
  dispatch,
  options = { reset: false, update: false, fetch: true },
  callbacks,
  // in config we pass the jwt
  config
}: PutActionProps) {
  // console.log('listingAction type : ' + type);
  const { requestAction, fulfilledAction, rejectedAction, resetAction } =
    getTypes(type)

  options.reset = options.reset !== undefined ? options.reset : false
  options.update = options.update !== undefined ? options.update : false
  options.fetch = options.fetch !== undefined ? options.fetch : true
  if (options.reset) {
    dispatch({ type: resetAction })
    if (callbacks?.reset) {
      callbacks.reset()
    }
  }
  dispatch({ type: requestAction })
  API()
    .put(url, data, config)
    .then((response) => {
      dispatch({
        type: fulfilledAction,
        payload: response.data
      })

      if (callbacks?.success) {
        callbacks.success(response.data)
      }
    })
    .catch((error) => {
      dispatch({
        type: rejectedAction,
        payload: error?.response?.data || error
      })
      manageError(error)
      if (callbacks?.error) {
        callbacks.error(error?.response?.data || error)
      }
      // manageError(error, () => {
      //     if (callbacks.error) {
      //         callbacks.error(error?.response?.data || error);
      //     }
      // });
      // actionTrackError({
      //     logLevel: LogLevels.INFO,
      //     extraData: {
      //         type,
      //         url,
      //         data,
      //         options,
      //     },
      //     error,
      // });
    })
}

interface DeleteActionProps {
  type: string
  url: string
  data?: object
  dispatch: AppDispatch
  options?: ReduxOptions
  callbacks?: ReduxCallbacks
  headers?: object
  config?: object
}

export function deleteAction({
  type,
  url,
  data,
  dispatch,
  options = { reset: false, update: false, fetch: true },
  callbacks,
  headers,
  config
}: DeleteActionProps) {
  const {
    requestAction,
    fulfilledAction,
    rejectedAction,
    resetAction
    // updateAction,
  } = getTypes(type)
  // default data
  options.reset = options.reset !== undefined ? options.reset : false
  options.update = options.update !== undefined ? options.update : false
  options.fetch = options.fetch !== undefined ? options.fetch : true

  // initialize logic
  if (options.reset) {
    dispatch({ type: resetAction })
    if (callbacks?.reset) {
      callbacks.reset()
    }
  }
  if (options.fetch) {
    dispatch({ type: requestAction })
    API(headers, config)
      .delete(url, data)
      .then((response) => {
        // if (options.update) {
        //     dispatch({
        //         type: updateAction,
        //         payload: response.data,
        //     });
        // } else {
        dispatch({
          type: fulfilledAction,
          payload: response.data
        })
        // }
        if (callbacks?.success) {
          callbacks.success(response.data)
        }
      })
      .catch((error) => {
        dispatch({
          type: rejectedAction,
          payload: error?.response?.data || error
        })
        manageError(error)
        if (callbacks?.error) {
          callbacks.error(error?.response?.data || error)
        }
        // manageError(error, () => {
        //     if (callbacks.error) {
        //         callbacks.error(error?.response?.data || error);
        //     }
        // });
        // actionTrackError({
        //     logLevel: LogLevels.INFO,
        //     extraData: {
        //         type,
        //         url,
        //         data,
        //         options,
        //     },
        //     error,
        // });
      })
  }
}

interface PatchActionProps {
  type: string
  url: string
  data?: object
  dispatch: AppDispatch
  options?: ReduxOptions
  callbacks?: ReduxCallbacks
  config?: object
}

export function patchAction({
  type,
  url,
  data,
  dispatch,
  options = { reset: false, update: false, fetch: true },
  callbacks,
  // in config we pass the jwt
  config
}: PatchActionProps) {
  // console.log('listingAction type : ' + type);
  const { requestAction, fulfilledAction, rejectedAction, resetAction } =
    getTypes(type)

  options.reset = options.reset !== undefined ? options.reset : false
  options.update = options.update !== undefined ? options.update : false
  options.fetch = options.fetch !== undefined ? options.fetch : true
  if (options.reset) {
    dispatch({ type: resetAction })
    if (callbacks?.reset) {
      callbacks.reset()
    }
  }
  dispatch({ type: requestAction })
  API()
    .patch(url, data, config)
    .then((response) => {
      dispatch({
        type: fulfilledAction,
        payload: response.data
      })

      if (callbacks?.success) {
        callbacks.success(response.data)
      }
    })
    .catch((error) => {
      dispatch({
        type: rejectedAction,
        payload: error?.response?.data || error
      })
      manageError(error)
      if (callbacks?.error) {
        callbacks.error(error?.response?.data || error)
      }
      // manageError(error, () => {
      //     if (callbacks.error) {
      //         callbacks.error(error?.response?.data || error);
      //     }
      // });
      // actionTrackError({
      //     logLevel: LogLevels.INFO,
      //     extraData: {
      //         type,
      //         url,
      //         data,
      //         options,
      //     },
      //     error,
      // });
    })
}
