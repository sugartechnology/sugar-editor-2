export function wait( time ) {
  return new Promise( ( response, reject ) => {
    setTimeout( () => {
      response();
    }, time );
  } );
};

export function waitTill(
  expression,
  resolveI
) {
  var p = new Promise( ( resolve, reject ) => {
    if ( !expression() ) {
      setTimeout( () => {
        waitTill( expression, resolveI ? resolveI : resolve );
      }, 1 );
    } else {
      if ( resolveI ) {
        resolveI( null );
      } else if ( resolve ) {
        resolve( null );
      }
    }
  } );
  return p;
};
