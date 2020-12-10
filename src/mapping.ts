import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import {
  LogChangeDCRMOwner,
  LogSwapin,
  LogSwapout,
  Transfer,
  Approval
} from "../generated/Contract/Contract"
import { TokenTransfer, TokenApproval, Mint, Burn, DCRMowner } from "../generated/schema"

export function toDecimalExponent(decimals: BigInt): BigInt {
  let decimalTotal = BigInt.fromI32(10);
	for (
		let i = BigInt.fromI32(1);
		i.lt(decimals);
		i = i.plus(BigInt.fromI32(1))
	) {
		decimalTotal = decimalTotal.times(BigInt.fromI32(10));
  }
	return decimalTotal;
}

export function convertToDecimal(
	amount: BigInt,
	decimalTotal: BigInt
): BigDecimal {
	return amount.toBigDecimal().div(decimalTotal.toBigDecimal());
}

export function handleLogChangeDCRMOwner(event: LogChangeDCRMOwner): void {
  let entity = DCRMowner.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new DCRMowner(event.transaction.hash.toHex())
  }
  entity.old_owner = event.params.oldOwner.toHex()
  entity.new_owner = event.params.newOwner.toHex()
  entity.effective_height = event.params.effectiveHeight
  entity.save()
}

export function handleLogSwapin(event: LogSwapin): void {
  let entity = Mint.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new Mint(event.transaction.hash.toHex())
  }

  let decimalsTotal = toDecimalExponent(BigInt.fromI32(18));
  let transferAmount = convertToDecimal(event.params.amount, decimalsTotal);
  
  entity.txhash = event.params.txhash.toHex()
  entity.account = event.params.account.toHex()
  entity.amount = transferAmount
  entity.save()
}

export function handleLogSwapout(event: LogSwapout): void {
  let entity = Burn.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new Burn(event.transaction.hash.toHex())
  }

  let decimalsTotal = toDecimalExponent(BigInt.fromI32(18));
  let transferAmount = convertToDecimal(event.params.amount, decimalsTotal);
  
  entity.account = event.params.account.toHex()
  entity.bind_address = event.params.bindaddr.toHex()
  entity.amount = transferAmount
  entity.save()
}

export function handleTransfer(event: Transfer): void {
  let entity = TokenTransfer.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new TokenTransfer(event.transaction.hash.toHex())
  }

  let decimalsTotal = toDecimalExponent(BigInt.fromI32(18));
  let transferAmount = convertToDecimal(event.params.value, decimalsTotal);

  entity.from = event.params.from.toHex()
  entity.to = event.params.to.toHex()
  entity.amount = transferAmount
  entity.timestamp = event.block.timestamp
  entity.save()

}

export function handleApproval(event: Approval): void {
  let entity = TokenApproval.load(event.transaction.hash.toHex())
  if (entity == null) {
    entity = new TokenApproval(event.transaction.hash.toHex())
  }

  let decimalsTotal = toDecimalExponent(BigInt.fromI32(18));
  let transferAmount = convertToDecimal(event.transaction.value, decimalsTotal);

  entity.from = event.params.owner.toHex()
  entity.to = event.params.spender.toHex()
  entity.amount = transferAmount
  entity.save()
}