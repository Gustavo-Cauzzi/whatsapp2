import {
  StackNavigationOptions,
  StackScreenProps,
  createStackNavigator,
} from '@react-navigation/stack';
import React from 'react';
import {groupBy, groupByAndMap} from '../../utils/Utils';
import {NonEmptyString, UnionToIntersection} from '../../utils/TsUtils';
import {TBuilderScreenList} from './screens';
import {NavigationProp, useNavigation} from '@react-navigation/native';

export type TUnionRoutes<
  BuilderScreensList extends IBuilderScreen<string, string, any>[],
> = UnionToIntersection<BuilderScreensList[number]['routeParam']>;

export type IRouteParams<T extends IBuilderScreen<string, string, {}>[]> = {
  [K in keyof TUnionRoutes<T>]: keyof TUnionRoutes<T>[K] extends never
    ? undefined
    : TUnionRoutes<T>[K];
};

export const useWaNavigation = () =>
  useNavigation<NavigationProp<IRouteParams<TBuilderScreenList>>>();

const Stack = createStackNavigator();

const getScreenPath = (buildedScreen: IBuilderScreen<string, string, any>) =>
  Object.keys(buildedScreen.routeParam)[0];
const getNavigatorPath = (
  buildedScreen: IBuilderScreen<string, string, {}>,
) => {
  const [modulo, screenName] = getScreenPath(buildedScreen).split('/');
  return `${modulo}/${screenName}`;
};

export const createNavigators = <
  BuilderScreensList extends IBuilderScreen<string, string, any>[],
>(
  builderScreensList: BuilderScreensList,
) => {
  const repeatedScreens = Object.entries(
    groupByAndMap(
      builderScreensList,
      getScreenPath,
      (_, acc?: number) => (acc ?? 0) + 1,
    ),
  )
    .filter(([_, repetition]) => repetition > 1)
    .map(([screenPath]) => {
      console.error(`Telas com caminho repetido. ${screenPath} removidas`);
      return screenPath;
    });

  const filteredScreens = builderScreensList.filter(
    screen => !repeatedScreens.includes(getScreenPath(screen)),
  );

  const mainScreens = groupBy(filteredScreens, getNavigatorPath);

  return Object.entries(mainScreens).map(([name, childScreens]) => ({
    name: name as keyof TUnionRoutes<BuilderScreensList>,
    Navigator: () => (
      <Stack.Navigator initialRouteName={name}>
        {childScreens.map(buildedScreen => buildedScreen.screen)}
      </Stack.Navigator>
    ),
  }));
};

export interface IBuilderScreen<
  Module extends string,
  Name extends string,
  Params,
> {
  routeParam: {
    [K in `${Lowercase<Module>}/${Name}`]: NonNullable<Params>;
  };
  screen: React.JSX.Element;
}
export const screenBuilder =
  <Module extends string>(module: NonEmptyString<Module>) =>
  <
    Name extends string,
    Comp extends React.FC<any>,
    Params extends React.ComponentProps<Comp>,
  >(
    name: Name,
    Component: Comp,
    options?: Pick<
      StackNavigationOptions,
      Exclude<keyof StackNavigationOptions, `header${string}`>
    > & {
      initialParams?: Params;
    },
  ) => {
    const screenPath = name;
    const ScreenComponent = ({
      route: {params},
    }: StackScreenProps<Record<string, Params>, string>) => (
      <Component {...((params ?? {}) as Params)} />
    );
    return {
      routeParam: {
        [`${module.toLowerCase()}/${name}`]: options?.initialParams,
      },
      screen: (
        <Stack.Screen
          key={screenPath}
          name={screenPath}
          //@ts-ignore
          component={ScreenComponent}
          options={{...options, headerShown: false}}
        />
      ),
    } as IBuilderScreen<Module, Name, Params>;
  };
