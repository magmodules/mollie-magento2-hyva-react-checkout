import React, { useEffect, useState } from 'react';
import { shape, func } from 'prop-types';
import { paymentMethodShape } from '../../../../utils/payment';
import RadioInput from '../../../../components/common/Form/RadioInput';
import useCheckoutFormContext from '../../../../hook/useCheckoutFormContext';
import useMolliePlaceOrder from '../hooks/useMolliePlaceOrder';
import useMollieIssuers from '../hooks/useMollieIssuers';
import Issuer from './Issuer';

function DefaultRenderer({ method, selected, actions }) {
  const isSelected = method.code === selected.code;

  const [issuers, setIssuers] = useState(false);
  const { getMollieIssuers, selectedIssuer, setSelectedIssuer } =
    useMollieIssuers();
  const { registerPaymentAction } = useCheckoutFormContext();
  const { placeOrder } = useMolliePlaceOrder({
    methodCode: method.code,
    selectedIssuer,
  });

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    registerPaymentAction(method.code, placeOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeOrder, isSelected, method.code, selectedIssuer]);

  useEffect(() => {
    if (issuers !== false || !isSelected) {
      return;
    }

    async function getIssuers() {
      setIssuers(await getMollieIssuers({ methodCode: method.code }));
    }

    getIssuers();
  }, [isSelected, issuers]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSelected || !issuers) {
    return (
      <RadioInput
        value={method.code}
        label={method.title}
        name="paymentMethod"
        checked={isSelected}
        onChange={actions.change}
      />
    );
  }

  return (
    <div>
      <div>
        <RadioInput
          value={method.code}
          label={method.title}
          name="paymentMethod"
          checked={isSelected}
          onChange={actions.change}
        />
        <ul className="ml-6">
          {issuers.map((issuer) => (
            <li key={issuer.code}>
              <Issuer
                issuer={issuer}
                checked={selectedIssuer === issuer.code}
                setSelectedIssuer={setSelectedIssuer}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

DefaultRenderer.propTypes = {
  method: paymentMethodShape.isRequired,
  selected: paymentMethodShape.isRequired,
  actions: shape({ change: func }).isRequired,
};

export default DefaultRenderer;
