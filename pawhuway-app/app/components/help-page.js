import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TextInput, Image, Button, TouchableOpacity, Alert, ScrollView} from 'react-native';
import { supabase }from '../../src/lib/supabase';
import { Stack,useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';

// const ticketPage = () => {
//     const router = useRouter();

//     const createTicket = () => {
//         router.push('/components/create-ticket')
//     }
//     const goBack = () => {
//         router.push('/components/landing-page-v2')
//     }
//     // const fetchUserProfile = async () => {
//     //             const { data: user, error } = await supabase.auth.getUser();
                
//     //             if (error) {
//     //                 console.error('Error fetching user:', error);
//     //                 return;
//     //             }
//     //             const userEmail = user?.user?.email;
//     //             // console.log("User ID:", userId);
//     //             const { data, error: profileError } = await supabase
//     //                 .from('user_accounts')
//     //                 .select('*')
//     //                 .eq('email_add',userEmail)
//     //                 .maybeSingle();
                
//     //             if (profileError) 
//     //                 console.error('Error fetching user:', profileError);
//     //             else{
//     //                 setImage(data.profile_picture || null);
//     //                 setFirstName(data.first_name)
//     //                 setLastName(data.last_name)
//     //             }
//     // };

//     return(
//         <LinearGradient colors={['#B3EBF2', '#85D1DB','#C9FDF2', '#B6F2D1']} style={styles.gradient}>
//             <SafeAreaView>
//                 <Stack.Screen options={{ headerShown: false }} />
//                 <StatusBar hidden={true} />
//                 <View>
//                     <TouchableOpacity style = {styles.backbtn} onPress={goBack}>
//                         <View>
//                             <AntDesign name="left" size={24} color="black" />
//                         </View>
//                     </TouchableOpacity>
//                     <Text style = {styles.yourTickets}>YOUR TICKETS</Text>
//                     <Text style = {styles.subtext}>Send us a message</Text>
//                 </View>
//                 <View style = {styles.addTicket}>
//                     <TouchableOpacity style = {styles.newbtn} onPress={createTicket}>
//                         <Text style = {styles.newText}>+ New</Text>
//                     </TouchableOpacity>
//                 </View>
//                 <View style = {styles.container}>
//                     <TouchableOpacity>
//                         <View style = {styles.tickets}>
//                         </View>
//                     </TouchableOpacity>
//                     <TouchableOpacity>
//                         <View style = {styles.tickets}>
//                         </View>
//                     </TouchableOpacity>
//                     <TouchableOpacity>
//                         <View style = {styles.tickets}>
//                         </View>
//                     </TouchableOpacity>
//                     <TouchableOpacity>
//                         <View style = {styles.tickets}>
//                         </View>
//                     </TouchableOpacity>
                    
                    


//                 </View>
//             </SafeAreaView>
//         </LinearGradient>

//     )
// }


// const styles = StyleSheet.create({
//     gradient:{
//         flex: 1,
//     },
//     yourTickets:{
//         fontFamily: 'Kanit Medium',
//         fontSize: 40,
//         marginLeft: 20,
//         marginTop: 70,
//         // position: 'absolute',
//     },
//     subtext:{
//         fontFamily: 'Poppins Light',
//         marginLeft: 25,
//         fontSize: 18,
//     },
//     tickets:{
//         backgroundColor: '#85D1DB',
//         height: 120,
//         width: '90%',
//         alignSelf: 'center',
//         // marginTop: 40,
//         borderRadius: 20,
//         borderColor: '#FFFFFF',
//         borderWidth: 2,
//         marginBottom: 15,
//     },
//     container:{
//         marginTop: 40,
//     },
//     addTicket:{
//         position: 'absolute',
//         alignSelf: 'flex-end',

//     },
//     newText:{
//         fontFamily: 'Poppins Light',
//         textAlign: 'center',
//     },
//     newbtn:{
//         // marginHorizontal: 20,
//         backgroundColor: '#FFFFFF',
//         borderRadius: 10,
//         marginVertical: 80,
//         right: 30,
//         padding: 10,
//     },
//     backbtn:{
//         position: 'absolute',
//         marginHorizontal: 20,
//         marginVertical: 30,
//     },





// })

// export default ticketPage



// Ticket card component
const TicketCard = ({ title, preview, date, status, icon }) => (
    <View style={styles.card}>
        <View style={styles.cardContent}>
            {icon}
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardPreview}>{preview}</Text>
                <View style={styles.ticketMeta}>
                    <Text style={styles.ticketDate}>{date}</Text>
                    <View style={[styles.statusBadge, 
                    status === 'Open' ? styles.statusOpen : 
                    status === 'Closed' ? styles.statusClosed : 
                    styles.statusPending
                    ]}>
                    <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const SupportTicketsPage = () => {
    const [pastTickets, setPastTickets] = useState([]);
    const[ticketnum, setTicketNum] = useState([]);
    const[subject,setSubject] = useState('');
    const[body,setBody] = useState('');
    const router = useRouter();
    const createTicket = () => {
        router.push('/components/create-ticket')
    }
    const goBack = () => {
        router.push('/components/landing-page-v2')
    }

    const fetchUserProfile = async () => {
        
        const { data: user, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Error fetching user:', error);
            return;
        }
        const userId = user?.user?.id;
        console.log("User ID:", userId);
        const { data, error: profileError } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id',userId)
        
        if (profileError) 
            console.error('Error fetching user:', profileError);
        else{
            setTicketNum(data.ticket_num)
            setSubject(data.subject)
            setBody(data.body)
            setPastTickets(data || [])
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);
    

    return (
    <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden={true} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Recent Tickets</Text>
            </View>
        
        {/* New Ticket Button */}
            <TouchableOpacity style={styles.newTicketButton} onPress={createTicket}>
                <Text style={styles.newTicketButtonText}>Create New Support Ticket</Text>
            </TouchableOpacity>
            
            {/* Past Tickets */}
            <View style={styles.ticketsContainer}>
                {pastTickets.map(ticket => (
                    <TicketCard 
                        key={ticket.ticket_num}
                        title={ticket.subject}
                        preview={ticket.body}
                        // date={ticket.date}
                        status={ticket.status}
                        // icon={ticket.icon}
                    />
                ))}
            
                {pastTickets.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            You haven't submitted any support tickets yet.
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.closeIconContainer}>
            <TouchableOpacity onPress={goBack}>
                <Icon name="close" size={30} color="black" />
            </TouchableOpacity>
        </View>
        </ScrollView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3EBF2', // Dark green background
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    header: {
        marginTop: 50,
        marginBottom: 15,
        alignItems: 'center',
    },
        subheader: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
        title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    newTicketButton: {
        backgroundColor: '#3C3C4C',
        paddingVertical: 14,
        borderRadius: 25,
        marginBottom: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    newTicketButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    ticketsContainer: {
        gap: 16, // Space between cards
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 4,
    },
    iconText: {
        fontSize: 18,
        color: 'white',
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    cardPreview: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
    },
    ticketMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    ticketDate: {
        fontSize: 12,
        color: '#888',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusOpen: {
        backgroundColor: 'rgba(13, 110, 110, 0.1)',
    },
    statusPending: {
        backgroundColor: 'rgba(255, 170, 0, 0.1)',
    },
    statusClosed: {
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#0D6E6E',
    },
    button: {
        backgroundColor: '#3C3C4C',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    closeIconContainer: {
        alignItems:'center',
        marginTop: 20,
        
    },
});

export default SupportTicketsPage;