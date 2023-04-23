import { fromEvent, EMPTY } from 'rxjs';
import { map, concatMap, tap, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

const endpointInput: HTMLInputElement =
  document.querySelector('input#endpoint');
const fetchButton: HTMLButtonElement = document.querySelector('button#fetch');

// Note: if error occurs in the inner subscriptions, the main/outer subscription gets ended. Type invalid end point value in the input element and click on fetch button to reproduce this scenario. Now after this error even if we input correct end point value, nothing happens as subscription is already ended as error occurred. So we have to address or handle these error cases.
// fromEvent(fetchButton, 'click')
//   .pipe(
//     tap((value) => console.log(value)),
//     map(() => endpointInput.value),
//     concatMap((value) =>
//       ajax(`https://random-data-api.com/api/${value}/random_${value}`)
//     )
//   )
//   .subscribe({
//     next: (value) => console.log(value),
//     error: (err) => console.log('Error:', err),
//   });

// Note: let's learn a bit more how the errors are handled by Flattening Operators and how can we live with them and control them in our favor.
// Let's now have a look at what happens when the inner Observable provided to 'concatMap' operator emits an error.
// As a side note, the behavior presented here will be the same for all Flattening Operators, not only 'concatMap'.
// Let's have a look at this example. So, the source Observable emits a value which reaches the Flattening Operator. In this example, let it be the 'concatMap' operator.
// So, a new inner Subscription is made to the Observable created using the 'getDataObservable' function for example.
// And let's say that this time this inner Observable emits an error after some time.
// What happens now?
// Previously, we saw that in case of the complete notification, 'concatMap' didn't reemit it to the output.
// This is different for the error notifications.
// In this case, the inner Observable's error will be reemitted to the output.
// This is important to remember as the error will also end our main/outer Subscription,so everything will stop working.
// And this is exactly what we've experienced in the coding section we just saw with above code snippet.
// As a side note, the Flattening Operator will also unsubscribe from the source Observable at this point, as it's no longer relevant to keep it because nothing more will happen there.
// Let's now see how can we prevent this error from stopping our main Subscription?
// Let's say we'd like to mask the error and hide it from the output, so our Observer wouldn't get this error. We could do something like this: have the source at the top, as always, then the 'concatMap' operator and then, below, add one more stage to our operators' pipeline, namely a 'catchError' operator, which would map the error to fallback observable i.e., the EMPTY Observable, which just completes immediately, so no error, but a complete notification would be passed to the output instead.
// Note: Let's run our code once more and let's provide a valid 'food' endpoint. And we can see that it works fine, and if I type in 'something-incorrect', like this, and click 'Fetch', we can see that our main Subscription completes. So even though we caught the error, we converted it into a complete notification, which still ends the main, the outer Subscription. Sometimes that's what we want, but in this example, we'd like our app to continue working after we try to fetch the data from some incorrect endpoint. We need to take some other approach. Lets ee this in second solution.
fromEvent(fetchButton, 'click')
  .pipe(
    tap((value) => console.log(value)),
    map(() => endpointInput.value),
    concatMap((value) =>
      ajax(`https://random-data-api.com/api/${value}/random_${value}`)
    ),
    catchError((err) => EMPTY)
  )
  .subscribe({
    next: (value) => console.log(value),
    error: (err) => console.log('Error:', err),
    complete: () => console.log('Completed'),
  });
