import { BigNumber } from '@ethersproject/bignumber'
import { Button, Space, Statistic } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import InputAccessoryButton from 'components/shared/InputAccessoryButton'
import FormattedNumberInput from 'components/shared/inputs/FormattedNumberInput'
import { ContractName } from 'constants/contract-name'
import { colors } from 'constants/styles/colors'
import { UserContext } from 'contexts/userContext'
import useContractReader, { ContractUpdateOn } from 'hooks/ContractReader'
import { useCallback, useContext, useMemo, useState } from 'react'
import { bigNumbersDiff } from 'utils/bigNumbersDiff'
import { formatWad, fromWad, parseWad } from 'utils/formatCurrency'

import TooltipLabel from '../shared/TooltipLabel'

export default function Rewards({
  projectId,
}: {
  projectId: BigNumber | undefined
}) {
  const {
    weth,
    contracts,
    transactor,
    userAddress,
    onNeedProvider,
  } = useContext(UserContext)

  const [redeemModalVisible, setRedeemModalVisible] = useState<boolean>(false)
  const [redeemAmount, setRedeemAmount] = useState<string>()
  const [minRedeemAmount, setMinRedeemAmount] = useState<BigNumber>()

  const ticketsUpdateOn: ContractUpdateOn = useMemo(
    () => [
      {
        contract: ContractName.Juicer,
        eventName: 'Pay',
        topics: projectId ? [[], projectId.toHexString()] : undefined,
      },
      {
        contract: ContractName.Juicer,
        eventName: 'Redeem',
        topics: projectId ? [[], projectId?.toHexString()] : undefined,
      },
    ],
    [projectId],
  )

  const bondingCurveRate = useContractReader<BigNumber>({
    contract: ContractName.Juicer,
    functionName: 'bondingCurveRate',
    valueDidChange: bigNumbersDiff,
  })
  const ticketsBalance = useContractReader<BigNumber>({
    contract: ContractName.TicketStore,
    functionName: 'balanceOf',
    args:
      userAddress && projectId ? [userAddress, projectId.toHexString()] : null,
    valueDidChange: bigNumbersDiff,
    updateOn: ticketsUpdateOn,
  })
  const ticketSupply = useContractReader<BigNumber>({
    contract: ContractName.TicketStore,
    functionName: 'totalSupply',
    args: [projectId?.toHexString()],
    valueDidChange: bigNumbersDiff,
    updateOn: ticketsUpdateOn,
  })
  const totalOverflow = useContractReader<BigNumber>({
    contract: ContractName.Juicer,
    functionName: 'currentOverflowOf',
    args: projectId ? [projectId.toHexString()] : null,
    valueDidChange: bigNumbersDiff,
    updateOn: useMemo(
      () =>
        projectId
          ? [
              {
                contract: ContractName.Juicer,
                eventName: 'Pay',
                topics: [[], projectId.toHexString()],
              },
              {
                contract: ContractName.Juicer,
                eventName: 'Tap',
                topics: [[], projectId.toHexString()],
              },
            ]
          : undefined,
      [projectId],
    ),
  })

  // TODO Juicer.claimableAmount
  const onChangeRedeemAmount = useCallback(
    (amount: string | undefined) => {
      setRedeemAmount(amount)

      if (
        amount === undefined ||
        !totalOverflow ||
        !bondingCurveRate ||
        !ticketSupply ||
        ticketSupply.eq(0)
      ) {
        setMinRedeemAmount(undefined)
      } else {
        setMinRedeemAmount(
          parseWad(amount)
            ?.mul(totalOverflow)
            .mul(bondingCurveRate)
            .div(1000)
            .div(ticketSupply),
        )
      }
    },
    [
      setRedeemAmount,
      setMinRedeemAmount,
      bondingCurveRate,
      ticketSupply,
      totalOverflow,
    ],
  )

  const share = ticketSupply?.gt(0)
    ? ticketsBalance?.mul(100).div(ticketSupply).toString()
    : '0'

  function redeem() {
    if (!transactor || !contracts) return onNeedProvider()

    if (!minRedeemAmount) return

    const redeemWad = parseWad(redeemAmount)

    if (!redeemWad || !projectId) return

    transactor(
      contracts.Juicer,
      'redeem',
      [
        projectId.toHexString(),
        redeemWad.toHexString(),
        minRedeemAmount.toHexString(),
        userAddress,
      ],
      {
        onConfirmed: () => onChangeRedeemAmount(undefined),
      },
    )
  }

  const subText = (text: string) => (
    <div
      style={{
        fontSize: '.8rem',
        fontWeight: 500,
        color: 'inherit',
      }}
    >
      {text}
    </div>
  )

  const redeemDisabled = !totalOverflow || totalOverflow.eq(0)

  return (
    <div>
      <Statistic
        title={
          <TooltipLabel
            label="Your wallet"
            tip="Tickets can be redeemed for your project's overflow according to the current term's bonding
        curve rate. Meaning, if the rate is 70% and there's 100 ETH overflow available
        with 100 of your Tickets in circulation, 10 Tickets could be redeemed
        for 7 ETH from the overflow. The rest is left to share between the
        remaining ticket hodlers."
            placement="bottom"
          />
        }
        valueRender={() => (
          <div>
            <div>{formatWad(ticketsBalance ?? 0)} credits</div>
            <div style={{ color: colors.bodySecondary }}>
              {subText(
                `${share ?? 0}% of ${
                  formatWad(ticketSupply) ?? 0
                } Tickets in circulation`,
              )}
            </div>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <FormattedNumberInput
                style={{ flex: 1, marginRight: 10 }}
                min={0}
                disabled={redeemDisabled}
                step={0.001}
                placeholder="0"
                value={redeemAmount}
                accessory={
                  <InputAccessoryButton
                    content="MAX"
                    onClick={() =>
                      onChangeRedeemAmount(fromWad(ticketsBalance))
                    }
                  />
                }
                onChange={val => onChangeRedeemAmount(val)}
              />
              <Button
                type="primary"
                onClick={() => setRedeemModalVisible(true)}
                disabled={redeemDisabled}
              >
                Redeem Tickets 
              </Button>
            </div>
          </div>
        )}
      />

      <Modal
        title="Redeem Tickets"
        visible={redeemModalVisible}
        onOk={() => {
          redeem()
          setRedeemModalVisible(false)
        }}
        onCancel={() => {
          onChangeRedeemAmount(undefined)
          setRedeemModalVisible(false)
        }}
        okText="Confirm"
        width={540}
      >
        <Space direction="vertical">
          <div>Redeem {redeemAmount} Tickets</div>
          <div>
            You will receive minimum {formatWad(minRedeemAmount)} {weth?.symbol}
          </div>
        </Space>
      </Modal>
    </div>
  )
}