import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS } from '../constants/colors.js'
import Footer from './Footer.jsx'

const SafeScreen = ({children}) => {
    const insets = useSafeAreaInsets();

  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: COLORS.background}}>
      <View style={{flex: 1}}>
        {children}
      </View>
      <Footer />
    </View>
  )
}

export default SafeScreen