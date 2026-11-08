import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";
import { DemoProvider } from "./lib/demo";
import { Landing } from "./pages/landing";
import { Master } from "./pages/master";
import { Business } from "./pages/business";
import { ConsumerMenu } from "./pages/menu";
import { Delivery } from "./pages/delivery";
import { Staff } from "./pages/staff";
function App() {
  return (
    <Provider>
      <DemoProvider>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/master" component={Master} />
          <Route path="/master/:section" component={Master} />
          <Route path="/business/:tenant">{(p) => <Business tenant={p.tenant} />}</Route>
          <Route path="/business/:tenant/:section">{(p) => <Business tenant={p.tenant} />}</Route>
          <Route path="/menu/:tenant">
            {(p) => <ConsumerMenu key={p.tenant} tenant={p.tenant} />}
          </Route>
          <Route path="/delivery" component={Delivery} />
          <Route path="/staff/:tenant">{(p) => <Staff tenant={p.tenant} />}</Route>
          <Route>
            <Landing />
          </Route>
        </Switch>
      </DemoProvider>
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}
export default App;
