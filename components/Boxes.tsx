import { Text, View } from './Themed';
import { Button } from 'react-native';

export default function Box(props) {
    let style = {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
    }

    if (!props.style || !(props.style.width || props.style.height)) {
        style.flex = 1;
        style.alignSelf = "stretch";
    }

    if (props.style) {
        style = {
            ...style,
            ...props.style
        }
    }

    return (
        <View style={style}>
            {props.children}
        </View>
    )
}

export function PrimaryBox(props) {
    let opacity = 0.9;
    if (props.style && props.style.opacity) {
        opacity = props.style.opacity;
    }

    let style = {
        backgroundColor: `rgba(247, 151, 13, ${opacity})`,
    }

    if (props.style) {
        style = {
            ...style,
            ...props.style
        }
    }

    return (
        <Box style={style}>
            {props.children}
        </Box>
    )
}

export function SecondaryBox(props) {
    let opacity = 0.12;
    if (props.style && props.style.opacity) {
        opacity = props.style.opacity;
    }

    let style = {
        backgroundColor: `rgba(62, 255, 191, ${opacity})`,
    }

    if (props.style) {
        style = {
            ...style,
            ...props.style
        }
    }

    return (
        <Box style={style}>
            {props.children}
        </Box>
    )
}