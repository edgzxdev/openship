import {
  Group,
  ActionIcon,
  Box,
  Text,
  Paper,
  Avatar,
  Input,
  Stack,
  useMantineTheme,
  Popper,
  Divider,
  NumberInput,
  Button,
  Collapse,
  Loader,
  Code,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { useRef, useState } from "react";
import useSWR from "swr";
import { DashIcon, PlusIcon, XIcon } from "@primer/octicons-react";
// import { FindMatch } from "./FindMatch";
import { GET_MATCH_QUERY } from "@graphql/matches";
import { FindMatch } from "./FindMatch";

export function ShopProductSearch({ shop, form, rightSection }) {
  const [searchEntry, setSearchEntry] = useState("");
  const [opened, setOpened] = useState(false);
  const handlers = useRef();

  const theme = useMantineTheme();

  const { accessToken, domain, searchProductsEndpoint } = shop;
  const params = new URLSearchParams({
    accessToken,
    domain,
    searchEntry,
  }).toString();

  const url = `${searchProductsEndpoint}?${params}`;

  const fetcher = async (url) => {
    try {
      const res = await fetch(url);
      return res.json();
    } catch (e) {
      throw e.message;
    }
  };

  const { data, error } = useSWR(
    searchProductsEndpoint && searchEntry ? url : null,
    fetcher
  );

  const { data: matchData } = useSWR(
    [
      GET_MATCH_QUERY,
      JSON.stringify({
        input: [
          {
            variantId: { equals: "39413325561934" },
            productId: { equals: "6616874057806" },
            quantity: { equals: 1 },
          },
        ],
      }),
    ],
    (query, variables) => request("/api/graphql", query, JSON.parse(variables))
  );

  const fields = form.values.shopProducts.map(
    ({ title, image, price, quantity = 1, productId, variantId }, index) => (
      <LineItemField
        title={title}
        image={image}
        productId={productId}
        price={price}
        quantity={quantity}
        variantId={variantId}
        form={form}
        index={index}
      />
    )
  );

  return (
    <Box mt="md">
      <Paper
        sx={{
          height: "auto",
          border: `1px solid ${
            theme.colors.gray[theme.colorScheme === "dark" ? 8 : 2]
          }`,
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          // fontSize: "16px !important",
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.fn.lighten(theme.colors.blueGray[0], 0.5),
          overflow: "hidden",
          "&:focus, &:focus-within": {
            outline: "none",
            borderColor: `${
              theme.colors[theme.primaryColor][
                theme.colorScheme === "dark" ? 8 : 5
              ]
            } !important`,
          },
        }}
      >
        <Text
          weight={500}
          sx={{
            color: theme.colors.blueGray[theme.colorScheme === "dark" ? 2 : 6],
            fontSize: theme.fontSizes.sm,
            paddingLeft: 10,
          }}
          mt={6}
        >
          Shop products
        </Text>
        {form.values.shopProducts.length > 0 ? (
          <Stack mt="xs" mb={8} spacing="xs">
            {fields}
          </Stack>
        ) : (
          <Paper
            m="sm"
            sx={{
              borderStyle: "dashed",
            }}
            background="white"
            shadow="xs"
            withBorder
          >
            <Text p="xs" size="sm" color="dimmed" align="center">
              None added
            </Text>
          </Paper>
        )}
        <Divider />
        <Input
          placeholder="Search..."
          // icon={<SearchIcon />}
          variant="unstyled"
          pt={4}
          pb={6}
          pl={12}
          styles={{
            input: { height: 22, lineHeight: 0 },
            wrapper: {
              background:
                theme.colorScheme === "dark" ? theme.colors.gray[8] : "#fff",
            },
            rightSection: { marginRight: 8 },
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setSearchEntry(e.target.value);
              setOpened(true);
            }
          }}
          rightSectionWidth={100}
          rightSection={<Box>{rightSection}</Box>}
        />
      </Paper>
      <Paper
        px="xs"
        pt={5}
        withBorder
        mt="sm"
        sx={{
          maxHeight: 200,
          overflow: "auto",
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.fn.lighten(theme.colors.blueGray[1], 0.5),
        }}
      >
        <Group mb={5}>
          <Text
            weight={500}
            sx={{
              color:
                theme.colors.blueGray[theme.colorScheme === "dark" ? 2 : 6],
              fontSize: theme.fontSizes.sm,
            }}
          >
            Results
          </Text>
          <Button
            size="xs"
            compact
            ml="auto"
            variant="light"
            color="gray"
            onClick={() => setOpened((o) => !o)}
          >
            {opened ? "Hide" : "Show"}
          </Button>
        </Group>
        <Collapse in={opened} transitionTimingFunction="linear">
          <Stack spacing="xs" pb="xs" sx={{ width: "100%" }}>
            {data?.products?.map(
              ({ title, image, price, productId, variantId }) => (
                <Box
                  onClick={() => {
                    form.addListItem("shopProducts", {
                      title,
                      image,
                      price,
                      quantity: 1,
                      productId,
                      variantId,
                      shop: {
                        id: shop.id,
                        name: shop.name,
                      },
                    });
                    setOpened(false);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <Paper withBorder p="xs">
                    <Group noWrap>
                      <Avatar src={image} />

                      <div>
                        <Text size="sm">{title}</Text>
                        <Text size="xs" color="dimmed">
                          {productId} | {variantId}
                        </Text>
                      </div>
                    </Group>
                  </Paper>
                </Box>
              )
            )}
          </Stack>
        </Collapse>
      </Paper>
      {form.values.shopProducts.length > 0 && (
        <FindMatch input={form.values.shopProducts} />
      )}
      {/* <Popper
        // ref={ref}
        mounted={data?.products.length > 0 && opened}
        referenceElement={referenceElement}
        transition="pop-top-left"
        transitionDuration={200}
        position="bottom"
        // placement="bottom-start"
        arrowStyle={{
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[5]
              : theme.colors.gray[1],
        }}
        modifiers={[
          {
            // @ts-ignore
            name: "sameWidth",
            enabled: true,
            phase: "beforeWrite",
            requires: ["computeStyles"],
            fn: ({ state }) => {
              // eslint-disable-next-line no-param-reassign
              state.styles.popper.width = `${state.rects.reference.width}px`;
            },
            effect: ({ state }) => {
              // eslint-disable-next-line no-param-reassign
              state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
            },
          },
          {},
        ]}
      >
        <Paper
          ref={ref}
          style={{
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.gray[1],
            maxHeight: 180,
            display: "flex",
            boxSizing: "border-box",
            pointerEvents: "auto",
            // backgroundColor:
            //   theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
            border: `1px solid ${
              theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[2]
            }`,
            overflowY: "auto",
            overscrollBehaviorY: "contain",
            width: "100%",
          }}
          shadow="sm"
          withBorder
          px={3}
          pt={3}
          pb={5}
        >
          <Stack spacing={3} sx={{ width: "100%" }}>
            {data?.products?.map(
              ({ title, image, price, productId, variantId }) => (
                <Box
                  onClick={() => {
                    form.addListItem("lineItems", {
                      title,
                      image,
                      price,
                      quantity: 1,
                      productId,
                      variantId,
                    });
                    setOpened(false);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <Paper withBorder p="xs">
                    <Group noWrap>
                      <Avatar src={image} />

                      <div>
                        <Text size="sm">{title}</Text>
                        <Text size="xs" color="dimmed">
                          {productId} | {variantId}
                        </Text>
                      </div>
                    </Group>
                  </Paper>
                </Box>
              )
            )}
          </Stack>
        </Paper>
      </Popper> */}
    </Box>
  );
}

function LineItemField({
  image,
  title,
  productId,
  variantId,
  price,
  quantity,
  form,
  index,
}) {
  const handlers = useRef();
  const theme = useMantineTheme();

  return (
    <Box mx={8}>
      <Paper withBorder shadow="xs" p="xs">
        <Group noWrap>
          <Avatar src={image} />

          <Stack spacing={2} sx={{ flex: 1 }}>
            <Text size="sm">{title}</Text>
            <Text size="xs" color="dimmed">
              {productId} | {variantId}
            </Text>
            <Group
              align="center"
              mt={5}
              spacing="xs"
              sx={{ justifyContent: "space-between" }}
            >
              <Group spacing={6}>
                <Text
                  size="md"
                  color={
                    theme.colorScheme === "light"
                      ? theme.colors.green[9]
                      : theme.colors.green[6]
                  }
                  weight={600}
                >
                  ${(price * quantity).toFixed(2)}
                </Text>
                {quantity > 1 && (
                  <Box>
                    <Text size="sm" color={theme.colors.dark[3]}>
                      (${price} x {quantity})
                    </Text>
                  </Box>
                )}
              </Group>
              <Group spacing={4}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: `0px 3px`,
                    borderRadius: theme.radius.sm,
                    border: `1px solid ${
                      theme.colorScheme === "dark"
                        ? "transparent"
                        : theme.colors.gray[3]
                    }`,
                    maxWidth: 100,
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[5]
                        : theme.white,

                    "&:focus-within": {
                      borderColor: theme.colors[theme.primaryColor][6],
                    },
                  }}
                >
                  <ActionIcon
                    size="xs"
                    variant="light"
                    onClick={() => handlers.current.decrement()}
                    // disabled={value === min}
                    // className={classes.control}
                    onMouseDown={(event) => event.preventDefault()}
                    sx={{
                      // backgroundColor:
                      //   theme.colorScheme === "dark"
                      //     ? theme.colors.dark[7]
                      //     : theme.white,
                      border: `1px solid ${
                        theme.colorScheme === "dark"
                          ? "transparent"
                          : theme.colors.gray[3]
                      }`,

                      "&:disabled": {
                        borderColor:
                          theme.colorScheme === "dark"
                            ? "transparent"
                            : theme.colors.gray[3],
                        opacity: 0.8,
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <DashIcon size={12} />
                  </ActionIcon>
                  <NumberInput
                    variant="unstyled"
                    handlersRef={handlers}
                    min={1}
                    // size="xs"
                    size="xs"
                    styles={{
                      input: {
                        minHeight: 0,
                        height: 22,
                        width: 28,
                        padding: 0,
                        textAlign: "center",
                        borderRadius: 0,
                        fontSize: 12,
                      },
                    }}
                    {...form.getListInputProps(
                      "shopProducts",
                      index,
                      "quantity"
                    )}
                  />

                  <ActionIcon
                    size="xs"
                    variant="light"
                    // color="gray"
                    onClick={() => handlers.current.increment()}
                    // disabled={value === min}
                    // className={classes.control}
                    onMouseDown={(event) => event.preventDefault()}
                    sx={{
                      // backgroundColor:
                      //   theme.colorScheme === "dark"
                      //     ? theme.colors.dark[7]
                      //     : theme.white,
                      border: `1px solid ${
                        theme.colorScheme === "dark"
                          ? "transparent"
                          : theme.colors.gray[3]
                      }`,

                      "&:disabled": {
                        borderColor:
                          theme.colorScheme === "dark"
                            ? "transparent"
                            : theme.colors.gray[3],
                        opacity: 0.8,
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <PlusIcon size={12} />
                  </ActionIcon>
                  <ActionIcon
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() => form.removeListItem("shopProducts", index)}
                    onMouseDown={(event) => event.preventDefault()}
                    sx={{
                      border: `1px solid ${
                        theme.colorScheme === "dark"
                          ? "transparent"
                          : theme.colors.red[3]
                      }`,

                      "&:disabled": {
                        borderColor:
                          theme.colorScheme === "dark"
                            ? "transparent"
                            : theme.colors.gray[3],
                        opacity: 0.8,
                        backgroundColor: "transparent",
                      },
                    }}
                    ml={6}
                  >
                    <XIcon size={12} />
                  </ActionIcon>
                </Box>
              </Group>
            </Group>
          </Stack>
        </Group>
      </Paper>
    </Box>
  );
}
