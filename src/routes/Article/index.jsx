import React, {Component} from 'react'
import { Layout, Affix, Button, Icon, 
    Tooltip, Col, Row,Drawer, Divider, 
    Collapse, Skeleton, Modal} from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { fetchPostById, solveLike, solveCollect, solveFollow, solveReward} from '../../redux/actions/posts'
import {getComment} from '../../redux/actions/comment'
import CommentApp from '../../components/Card/Comment/CommentApp'
import './index.css';
import collect from '../../assets/collect.png'
import nullCollect from '../../assets/nullCollect.png'
import like from '../../assets/like.png'
import nullLike from '../../assets/nullLike.png'
import share from '../../assets/share.png'
import energy from '../../assets/energy.png'
import {FormatTime} from '../../components/utils/formatTime'
//import http from '../../services/server';
const { Content} = Layout;
const Panel = Collapse.Panel;

const pStyle = {
    fontSize: 16,
    color: 'rgba(0,0,0,0.85)',
    lineHeight: '24px',
    display: 'block',
    marginBottom: 16,
};

const introStyle = {
    fontSize: 14,
    color: 'rgb(144,144,144)',
    lineHeight: '24px',
    display: 'block',
    marginBottom: 16,
};

  const DescriptionItem = ({ title, content }) => (
    <div
      style={{
        fontSize: 14,
        lineHeight: '22px',
        marginBottom: 7,
        color: 'rgba(0,0,0,0.65)',
      }}
    >
      <p
        style={{
          marginRight: 8,
          display: 'inline-block',
          color: 'rgba(0,0,0,0.85)',
        }}
      >
        {title}:
      </p>
      {content}
    </div>
  );

class readArticle extends Component{
    state = {
        newContent: '',
        visible: false,
        energyRewardTimes: 0,
        modalVisible: false,
    }; 
    static propTypes = {
    readingPost: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired
    }
    componentDidMount() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const data = {
            post_id: this.props.match.params.id,
            user_id: userInfo.user_id,
        }
        this.props.dispatch(fetchPostById(data))
        this.props.dispatch(getComment(data.post_id))
        setTimeout(function timer() {
        // TODO: 待添加一个10秒后自增的阅读数
        console.log('10086')
        },10 * 1000)
            
    }
    handleCollect = () => {
        const post = this.props.readingPost[0]
        var data = {
            action: '',
            user_id: this.props.user_id,
            user_name: this.props.user_name,
            author_id: post.author_id,
            author_name: post.author_name,
            post_id: post.post_id,   
            post_title: post.post_title,
            created_at: FormatTime("yyyy-MM-dd hh:mm", +new Date())
        }
        if(this.props.collect_status) {
            data.action = 'cancel'
            this.props.dispatch(solveCollect(data))
        } else {
            data.action = 'add'
            this.props.dispatch(solveCollect(data))
        }
    }
    handleLike = () => {
        const post = this.props.readingPost[0]
        var data = {
            action: '',
            user_id: this.props.user_id,
            user_name: this.props.user_name,
            author_id: post.author_id,
            author_name: post.author_name,
            post_id: post.post_id,
            post_title: post.post_title,
            created_at: FormatTime("yyyy-MM-dd hh:mm", +new Date())
        }
        if(this.props.like_status) {
            data.action= 'cancel'
            this.props.dispatch(solveLike(data))
        } else {
            data.action = 'add'
            this.props.dispatch(solveLike(data))
        }
        
    }
    handleFollow = () => {
        const post = this.props.readingPost[0]
        var data = {
            action: '',
            user_id: this.props.user_id,
            user_name: this.props.user_name,
            followed_user_id: post.author_id,
            followed_user_name: post.author_name,
            created_at: FormatTime("yyyy-MM-dd hh:mm", +new Date())
        }
        if(this.props.follow_status) {
            data.action = 'cancel'
            this.props.dispatch(solveFollow(data))
        } else {
            data.action = 'add'
            this.props.dispatch(solveFollow(data))
        }
    }
    handleReward = () => {
        const rewardNumber = this.props.reward_number
        let rewardTimes = this.state.energyRewardTimes
        const owned = this.props.energy_owned - rewardTimes*rewardNumber
        if(owned < rewardNumber) {
            Modal.error({
                title: '错误',
                content: '您的能量余额已不足，请充值',
              });
        } else {
            const modalContent= '确定打赏 '+ rewardNumber +' 点能量给作者吗？';
            this.setState({modalText: modalContent, modalVisible: true})
        }
    }
    handleOK = () => {
        const rewardNumber = this.props.reward_number
        let rewardTimes = this.state.energyRewardTimes
        var newInfo = this.props.userInfo
        const post = this.props.readingPost[0]
        newInfo.energy_owned = newInfo.energy_owned - rewardNumber
        const rewardInfo = {
            reward_number: rewardNumber,
            user_id: newInfo.user_id,
            user_name: newInfo.user_name,
            rewarded_user_id: post.author_id,
            rewarded_user_name: post.author_name,
            post_id: post.post_id, 
            post_title: post.post_title,
            created_at: FormatTime("yyyy-MM-dd hh:mm", +new Date())
        }
        this.props.dispatch(solveReward(rewardInfo, newInfo))
        this.setState({energyRewardTimes: ++rewardTimes, modalVisible: false})
    }
    handleCancel = () => {
        this.setState({modalVisible: false})
    }

    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };
    
    onClose = () => {
        this.setState({
        visible: false,
        });
    };

    render(){
        const { isFetching } = this.props
        const isEmpty = this.props.readingPost.length === 0
        if(!this.props.fetchStatus){
            return (<Redirect to="/404" />);
        }
        return(
            <div>
            <div className="article-wrapper">
                
                <Layout style={{ padding: '24px 0', background: '#fff' }}>
                    {isEmpty
                        ? (isFetching ?  <div style={{width: 1000, marginLeft: 300}}><Skeleton active /><Skeleton active /><Skeleton active avatar/></div> : <h2>Empty.</h2>) :
                        <Affix offsetTop={500} onChange={affixed => console.log(affixed)} className='button-wrapper'>
                            <Tooltip placement="right" title='收藏'>
                                <Button 
                                ghost 
                                style={{width:80, height: 80, border:false}}
                                onClick={this.handleCollect}
                                >
                                {this.props.collect_status
                                    ?<img style={{width: 40}} src={collect} alt=""></img>
                                    :<img style={{width: 40}} src={nullCollect} alt=""></img>}
                                </Button>
                            </Tooltip>
                            <Tooltip placement="right" title='喜欢'>
                                <Button 
                                ghost 
                                style={{width:80, height: 80, border:false}}
                                onClick={this.handleLike}
                                >
                                {this.props.like_status
                                    ?<img style={{width: 40}} src={like} alt=""></img>
                                    :<img style={{width: 40}} src={nullLike} alt=""></img>}
                                </Button>
                            </Tooltip>
                            <Tooltip placement="right" title='分享'>
                                <Button ghost style={{width:80, height: 80, border:false}}><img style={{width: 40}} src={share} alt=""></img></Button>
                            </Tooltip>   
                        </Affix>
                    }  
                        
                        <Content style={{ padding: '0 24px',minHeight: 300, overflow: 'hidden' }} className="article-content">
                        <div>
                            {isEmpty
                            ? (isFetching ? <div></div> : <h2>Empty.</h2>)
                            : <div >
                                    <div>
                                        <h1  align="center"><div dangerouslySetInnerHTML = {{ __html:this.props.readingPost[0].post_title }}></div></h1>
                                        <br/>

                                        <Collapse bordered={false} defaultActiveKey={['1']}>
                                            <Panel header="文章信息" key="1">
                                            <div className='message-wrapper' style={{ marginLeft: 50}}>
                                                <p style={{ ...pStyle, marginBottom: 24}}>
                                                作者：&nbsp;{this.props.readingPost[0].author_name}
                                                <Button 
                                                type={this.props.follow_status?"":"primary"}
                                                shape="round"
                                                style={{marginLeft: 20}}
                                                onClick={this.handleFollow}
                                                className="follow-button"
                                                >
                                                {this.props.follow_status
                                                    ?<div className='inner-button'>
                                                        <span className="first-display">已关注<Icon type="check"></Icon></span>
                                                        <span className="second-display">取消关注</span>
                                                    </div>
                                                    :<div>关注<Icon type="plus"></Icon></div>
                                                    }
                                                </Button>
                                                </p>
                                                <p style={{ ...introStyle, marginBottom: 24}}>
                                                <Icon type="eye"/>浏览量:{this.props.readingPost[0].post_views}
                                                <Icon type="message" style={{marginLeft: 20}}/>评论数:{this.props.readingPost[0].post_comments}
                                                <Icon type="star" style={{marginLeft: 20}}/>收藏数:{this.props.readingPost[0].post_collects}
                                                <Icon type="like" style={{marginLeft: 20}}/>点赞数:{this.props.readingPost[0].post_likes}                          
                                                <Icon type="gift" style={{marginLeft: 20}}/>能量值:{this.props.readingPost[0].post_reward}  
                                                </p>
                                            </div>
                                            </Panel>
                                        </Collapse>
                                        


                                        <br/>
                                        <br/>
                                        <div dangerouslySetInnerHTML = {{ __html:this.props.readingPost[0].post_content_html }}></div>
                                        <br/>
                                        <br/>
                                        <br/>
                                        <div style={{marginLeft: 400}}>
                                        
                                            <Button type="primary" onClick={this.showDrawer}>
                                            文章信息
                                            </Button>
                                            <Tooltip placement="right" title={this.props.user_id.toString() === this.props.readingPost[0].author_id
                                                    ?'您不能打赏自己的文章！':'欢迎打赏能量！'}>
                                                <Button 
                                                shape="circle" 
                                                style={{width:120, height: 120, marginLeft: 70}} 
                                                onClick={this.handleReward}
                                                disabled={this.props.user_id.toString() === this.props.readingPost[0].author_id
                                                    ?true:false}
                                                ref='commentarea'
                                                >
                                                <img style={{width: 100}} src={energy} alt=""></img>
                                                </Button>
                                                
                                            </Tooltip>
                                            <Modal
                                                title="操作确认"
                                                visible={this.state.modalVisible}
                                                onOk={this.handleOK}
                                                onCancel={this.handleCancel}
                                                >
                                                <p>{this.state.modalText}</p>
                                            </Modal>
                                            <br/>
                                            <Drawer
                                            width={640}
                                            placement="right"
                                            closable={false}
                                            onClose={this.onClose}
                                            visible={this.state.visible}
                                            >
                                            <p style={{ ...pStyle, marginBottom: 24 }}>文章信息<Icon type="insurance" style={{fontSize: 30, color: '#0000FF', marginLeft: 230}}/>&nbsp;&nbsp;版权保护</p>
                                            <Divider />
                                            <p style={pStyle}>作者信息</p>
                                            <Row>
                                                <Col span={12}>
                                                <DescriptionItem title="作者" content={this.props.readingPost[0].author_name} />
                                                
                                                </Col>
                                                <Col span={12}>
                                                <Button 
                                                type={this.props.follow_status?"":"primary"}
                                                shape="round"
                                                style={{marginBottom: 16, marginTop: 0}}
                                                onClick={this.handleFollow}
                                                className="follow-button"
                                                >
                                                {this.props.follow_status
                                                    ?<div className='inner-button'>
                                                        <span className="first-display">已关注<Icon type="check"></Icon></span>
                                                        <span className="second-display">取消关注</span>
                                                    </div>
                                                    :<div>关注<Icon type="plus"></Icon></div>
                                                    }
                                                </Button>
                                                
                                                </Col>
                                            </Row>
                                            
                                            <Row>
                                                <Col span={12}>
                                                <DescriptionItem title="城市" content="广州" />
                                                </Col>
                                                <Col span={12}>
                                                <DescriptionItem title="国家" content="China🇨🇳" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={12}>
                                                <DescriptionItem title="生日" content="10月24日" />
                                                </Col>
                                                <Col span={12}>
                                                <DescriptionItem title="个人主页" content={<a href={`http://localhost:3000/u/${this.props.readingPost[0].author_id}`}>立即前往</a>}/>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={24}>
                                                <DescriptionItem
                                                    title="个人简介"
                                                    content="Make things as simple as possible but no simpler."
                                                />
                                                </Col>
                                            </Row>
                                            <Divider />
                                            <p style={pStyle}>文章信息</p>
                                            <Row>
                                                <Col span={12}>
                                                <DescriptionItem title="发布时间" content={this.props.readingPost[0].release_moment} />
                                                </Col>
                                                <Col span={12}>
                                                <DescriptionItem title="更新时间" content={this.props.readingPost[0].post_moment} />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={24}>
                                                <DescriptionItem 
                                                    title="文章简介" 
                                                    content={this.props.readingPost[0].article_intro} 
                                                />
                                                </Col>
                                                
                                            </Row>
                                            <Row>
                                                <Col span={24}>
                                                <DescriptionItem
                                                    title="文章识别码"
                                                    content={this.props.readingPost[0].blockchain_id}
                                                />
                                                </Col>
                                            </Row>
                                            <Divider />
                                            <p style={pStyle}>版权管理</p>
                                            <Row>
                                                <Col span={12}>
                                                <DescriptionItem title="投诉邮箱" content="940095072@example.com" />
                                                </Col>
                                                <Col span={12}>
                                                <DescriptionItem title="投诉电话" content="+86 181 0000 0000" />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col span={24}>
                                                <DescriptionItem
                                                    title="Github"
                                                    content={(
                                                    <a href="https://github.com/Bitnut/blockchainForum-bob">
                                                        github.com/ant-design/ant-design/
                                                    </a>
                                                    )}
                                                />
                                                </Col>
                                            </Row>
                                            </Drawer>
                                        <br/>
                                            <p>奖励能量，支持一下作者吧～</p>
                                        </div>
                                        <br/>
                                        <br/>
                                        <br/>
                                    </div>
                                    <div >
                                            <CommentApp post_id={this.props.readingPost[0].post_id}/>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="read-text" dangerouslySetInnerHTML={{__html: this.state.newContent != null ? this.state.newContent : "本章似乎丢失了！" }}></div>
                        
                        </Content>
                    
            </Layout>       
            </div>
            </div>
        )
    }
}


const mapStateToProps = state => {
    const { posts } = state  
    return {
        user_id: state.user.userInfo.user_id,
        user_name: state.user.userInfo.user_name,
        userInfo: state.user.userInfo,
        reward_number: state.user.userInfo.reward_number,
        energy_owned: state.user.userInfo.energy_owned,
        readingPost: posts.readingPost,
        isFetching: posts.isFetching,
        fetchStatus: posts.fetchStatus,
        like_status: posts.like_status,
        follow_status: posts.follow_status,
        collect_status: posts.collect_status
    }
}


export default connect(mapStateToProps)(readArticle)