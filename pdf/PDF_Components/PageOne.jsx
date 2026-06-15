// src/PDF_Components/PageOne.jsx
import { Page, View, StyleSheet, Image } from '@react-pdf/renderer';
import ISKCON_DHANBAD_BG_Base64 from '../assets/ISKCON_DHANBAD_BG';
import ISKCON_DHANBAD_LOGO_Base64 from '../assets/ISKCON_DHANBAD_LOGO';
import IskconInfo from './PageOneComponents/IskonInfo';
import ExtensionCentreInfo from './PageOneComponents/ExtensionCentreInfo';
import DonationReceiptHeader from './PageOneComponents/DonationReceiptHeader';
import DonationAmountInput from './PageOneComponents/DonationAmountInput';
import RegisteredOfficeInfo from './PageOneComponents/RegisteredOfficeInfo';
import DonorDetailsBox from './PageOneComponents/DonorDetailsBox';
import PaymentDetailsBox from './PageOneComponents/PaymentDetailsBox';
import SignatureFieldsBox from './PageOneComponents/SignatureFieldsBox';
import formatDate from '../utils/formatDate';

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    padding: 20,
    display: 'flex',
    gap: 5,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: '150px',
  },
  field: {
    marginBottom: 16,
    fontSize: 18,
    color: '#000',
  },
});

const PageOne = ({ formData }) => {
  const {
    receiptNumber,
    receiptDate,
    amountNumber,
    name,
    address,
    pincode,
    mobile,
    email,
    pan,
    paymentMode,
    paymentDetails,
    donationPurpose,
    donorCultivatorId,
    donationId,
  } = formData;

  console.log(formData);
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Image src={ISKCON_DHANBAD_BG_Base64} style={styles.backgroundImage} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Image src={ISKCON_DHANBAD_LOGO_Base64} style={styles.logo} />
          <View>
            <IskconInfo />
            <View style={styles.header}>
              <ExtensionCentreInfo />
              <DonationReceiptHeader
                receiptNumber={receiptNumber}
                receiptDate={formatDate(receiptDate)}
              />
            </View>
          </View>
        </View>
        <View>
          <DonationAmountInput amountNumber={amountNumber} />
        </View>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <DonorDetailsBox
            donor={{
              name: name,
              address: address,
              pincode: pincode,
              mobile: mobile,
              email: email,
              pan: pan,
            }}
          />
          <View style={{ width: '50%' }}>
            <PaymentDetailsBox
              width={300}
              paymentMode={paymentMode}
              paymentDetails={paymentDetails}
              donationPurpose={donationPurpose}
              donationId={donationId}
            />
            <SignatureFieldsBox donorCultivatorId={donorCultivatorId} />
          </View>
        </View>
        <View>
          <RegisteredOfficeInfo />
        </View>
      </View>
    </Page>
  );
};

export default PageOne;
